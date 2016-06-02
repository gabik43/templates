app.register('ui', 'datepicker', function() {

    // требует на вход дату 11.11.1111
    // на выход транслирует new Date(1111, 10, 11) и строку 11.11.1111

    function Datepicker(params) {
        this.el = params.el;
        this.monthEl = this.el.querySelector('._month');
        this.yearEl = this.el.querySelector('._year');
        this.next = this.el.querySelector('._next');
        this.prev = this.el.querySelector('._prev');
        this.body = this.el.querySelector('.datepicker_body');

        this.en = app.en;

        this.outputElId = this.el.getAttribute('data-el-id');
        this.hideonblur = this.el.classList.contains('js-hideonblur');

        if ( this.el.getAttribute('data-pos') === 'abs' ) {
            this.el.style.cssText = 'position: absolute; ' +
            'top: ' + this.el.getAttribute('data-top') + '; ' +
            'left: ' + this.el.getAttribute('data-left') + '; ' +
            'display: ' + this.el.getAttribute('data-display') + ';';
        }

        this.currentDay = null;
        this.selectedDay = null;
        this.maxDay = null;
        this.minDay = null;

        this.initialize();
    }

    Datepicker.prototype = {
        constructor: Datepicker,

        monthHash: {
            0: 'Январь',
            1: 'Февраль',
            2: 'Март',
            3: 'Апрель',
            4: 'Май',
            5: 'Июнь',
            6: 'Июль',
            7: 'Август',
            8: 'Сентябрь',
            9: 'Октябрь',
            10: 'Ноябрь',
            11: 'Декабрь'
        },

        monthHashEn: {
            0: 'January',
            1: 'February',
            2: 'March',
            3: 'April',
            4: 'May',
            5: 'June',
            6: 'July',
            7: 'August',
            8: 'September',
            9: 'October',
            10: 'November',
            11: 'December'
        },

        parseStrToDate: function(str) {
            var ar = str.split('.');
            if ( ar[2].length === 2 ) ar[2] = '20' + ar[2];
            if ( ar[1].charAt(0) === '0' ) ar[1] = ar[1].slice(1);
            if ( ar[0].charAt(0) === '0' ) ar[0] = ar[0].slice(1);
            ar[2] = parseInt(ar[2], 10);
            ar[1] = parseInt(ar[1], 10) - 1;
            ar[0] = parseInt(ar[0], 10);

            return new Date(ar[2], ar[1], ar[0]);
        },

        initialize: function() {
            this.defineDates();
            this.drawDatepicker(this.date);
            this.bindEvents();
        },

        defineDates: function() {
            var strDateShow = this.el.getAttribute('data-show');
            var strDateMin = this.el.getAttribute('data-min');
            var strDateMax = this.el.getAttribute('data-max');
            this.dateShow = (strDateShow)? this.parseStrToDate(strDateShow) : null;

            if ( strDateMin ) {
                if ( strDateMin === 'current' ) this.minDate = new Date();
                else this.minDate = this.parseStrToDate(strDateMin);
            } else { this.minDate = null; }

            if ( strDateMax ) {
                if ( strDateMax === 'current' ) this.maxDate = new Date();
                else this.maxDate = this.parseStrToDate(strDateMax);
            } else { this.maxDate = null; }

            this.date = this.dateShow || this.date || new Date();
            this.el.setAttribute('data-show', '');
            this.dateShow = null;
        },

        drawDatepicker: function(date) {
            var defs = this.getDefinitions(date);
            this.body.innerHTML = this.getDatepickerHtml(defs);
        },

        getDefinitions: function(date) {
            this.month = date.getMonth();
            this.year = date.getFullYear();

            this.defineCurrentDateIfExist();
            this.defineSelectedDateIfExist();
            this.handleMaxDayIfExist(); // запретит прокручивать вперед и сделает неактивными дни после Max
            this.handleMinDayIfExist(); // запретит прокручивать назад и сделает неактивными дни перед Min

            date.setDate(1);
            var weekDay = date.getDay();
            if ( weekDay === 0 ) weekDay = 7;
            var dayInThisMonth = (new Date(this.year, this.month + 1, 0)).getDate();
            var dayInPrevMonth = (new Date(this.year, this.month, 0)).getDate();
            var prevMonthDaysToPrint = weekDay - 1;
            var rowsQty = Math.ceil((prevMonthDaysToPrint + dayInThisMonth) / 7);

            return {
                dayInPrevMonth: dayInPrevMonth,
                prevMonthDaysToPrint: prevMonthDaysToPrint,
                dayInThisMonth: dayInThisMonth,
                rowsQty: rowsQty,
                day: weekDay
            }
        },

        defineCurrentDateIfExist: function() {
            var currentDate = new Date();
            if ( currentDate.getFullYear() === this.year && currentDate.getMonth() === this.month ) {
                this.currentDay = currentDate.getDate();
            } else {
                this.currentDay = null;
            }
        },

        defineSelectedDateIfExist: function() {
            if ( !this.selectedDate ) return false;
            var selectedDate = this.selectedDate;
            if ( selectedDate.getFullYear() === this.year && selectedDate.getMonth() === this.month ) {
                this.selectedDay = selectedDate.getDate();
            } else {
                this.selectedDay = null;
            }
        },

        handleMaxDayIfExist: function() {
            if ( !this.maxDate ) return false;
            var maxDate = this.maxDate;
            if ( maxDate.getFullYear() === this.year && maxDate.getMonth() === this.month ) {
                this.maxDay = maxDate.getDate();
                this.next.classList.add('-disabled');
            } else {
                this.maxDay = null;
                this.next.classList.remove('-disabled');
            }
        },

        handleMinDayIfExist: function() {
            if ( !this.minDate ) return false;
            var minDate = this.minDate;
            if ( minDate.getFullYear() === this.year && minDate.getMonth() === this.month ) {
                this.minDay = minDate.getDate();
                this.prev.classList.add('-disabled');
            } else {
                this.minDay = null;
                this.prev.classList.remove('-disabled');
            }
        },

        getDatepickerHtml: function(defs) {
            this.monthEl.innerHTML = (this.en)? this.monthHashEn[this.month] : this.monthHash[this.month];
            this.yearEl.innerHTML = this.year;

            var prevTdAr = this.getPrevDays(defs.dayInPrevMonth, defs.prevMonthDaysToPrint);
            var nextTdAr = this.getNextDays(defs.dayInThisMonth, defs.rowsQty, defs.day);
            var currentTdAr = this.getCurrentDays(defs.dayInThisMonth);
            var totalTdAr = prevTdAr.concat(currentTdAr, nextTdAr);
            var rowsAr = this.getDataInRows(totalTdAr);

            return this.getTable(rowsAr);
        },

        getPrevDays: function(dayInPrevMonth, prevMonthDaysToPrint) {
            var ar = [];
            for (var i = dayInPrevMonth; i > (dayInPrevMonth - prevMonthDaysToPrint); i--) {
                ar.push( '<td class="datepicker_td -disabled">' + i + '</td>' );
            }
            return ar.reverse();
        },

        getNextDays: function(dayInThisMonth, rowsQty, day) {
            var stop = rowsQty * 7 - dayInThisMonth - (day - 1);
            var ar = [];
            for (var i = 1; i <= stop; i++) {
                ar.push( '<td class="datepicker_td -disabled">' + i + '</td>' );
            }
            return ar;
        },

        getCurrentDays: function(dayInThisMonth) {
            var ar = [];
            for (var i = 1; i <= dayInThisMonth; i++) {
                var clsStr = 'datepicker_td';
                if ( this.currentDay && i === this.currentDay && this.selectedDay && i === this.selectedDay ) {
                    clsStr += ' _current -selected';
                }
                else if ( this.currentDay && i === this.currentDay ) {
                    clsStr += ' _current';
                }
                else if ( this.selectedDay && i === this.selectedDay ) {
                    clsStr += ' -selected';
                }

                if ( this.maxDay && i > this.maxDay ) {
                    clsStr += ' -disabled';
                }

                if ( this.minDay && i < this.minDay ) {
                    clsStr += ' -disabled';
                }

                ar.push( '<td class="' + clsStr + '">' + i + '</td>' );
            }
            return ar;
        },

        getDataInRows: function(totalTdAr) {
            var ar = [];
            var tr = '<tr class="datepicker_tr">';
            for (var i = 1, len = totalTdAr.length; i <= len; i++) {
                tr += totalTdAr[i - 1];
                if ( i % 7 === 0 ) {
                    tr += '</tr>';
                    ar.push(tr);
                    tr = '<tr class="datepicker_tr">';
                }
            }
            return ar;
        },

        getTable: function(rowsAr) {
            var table = '<table>';
            for (var i = 0, len = rowsAr.length; i < len; i++) {
                table += rowsAr[i];
            }
            table += '</table>';
            return table;
        },

        getNextMonth: function() {
            if ( this.month === 11 ) {
                this.year++;
                this.month = 0;
            } else {
                this.month++;
            }

            this.day = 1;

            this.date = new Date(this.year, this.month);
            this.drawDatepicker(this.date);
        },

        getPrevMonth: function() {
            if ( this.month === 0 ) {
                this.year--;
                this.month = 11;
            } else {
                this.month--;
            }

            this.day = 1;

            this.date = new Date(this.year, this.month);
            this.drawDatepicker(this.date);
        },

        checkIncomingDate: function(dateStr) {
            if ( dateStr.length === 10 ) {
                var reg = new RegExp('^(0[1-9]|[12][0-9]|3[01])\\.(0[1-9]|1[012])\\.(19|20)\\d\\d$');
                if (reg.test(dateStr)) {
                    var date = this.parseStrToDate(dateStr);
                    if ( this.maxDate && date.getTime() > this.maxDate.getTime() ) return false;
                    if ( this.minDate && date.getTime() < this.minDate.getTime() ) return false;
                    return true;
                }
            }
            return false;
        },

        show: function(o) {
            if ( o && o.date ) {
                if ( this.checkIncomingDate(o.date) ) {
                    this.date = this.parseStrToDate(o.date);
                    this.selectedDate = this.date;
                    this.selectedDay = this.date.getDate();
                } else {
                    this.date = this.dateShow || new Date();
                    this.selectedDate = null;
                    this.selectedDay = null;
                }
            }

            this.defineDates();
            this.drawDatepicker(this.date);
            this.el.style.display = 'block';

            app.ext.pubsub.fireEvent('datepicker:shown', {elId: this.outputElId});
            app.ext.pubsub.fireEvent('close-other-dropdowns', {id: this.el.id});

            app.historyDropdownOpened = true;
        },

        hide: function() {
            this.el.style.display = 'none';
            app.ext.pubsub.fireEvent('datepicker:hidden', {elId: this.outputElId});

            app.historyDropdownOpened = false;
        },

        notifyAboutChanges: function(date, dateStr) {
            app.ext.pubsub.fireEvent('date:' + this.outputElId + ':changed', {date: date, dateStr: dateStr});
        },

        bindEvents: function() {
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickDatepickerCell));
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickMoveCtrl));
            app.ext.tools.addListener(app.el, 'click', app.ext.tools.bind(this, this.hide));

            app.ext.pubsub.addListener('datepicker:' + this.outputElId + ':show', app.ext.tools.bind(this, this.show));
            app.ext.pubsub.addListener('datepicker:' + this.outputElId + ':hide', app.ext.tools.bind(this, this.hide));

            app.ext.pubsub.addListener('close-other-dropdowns', app.ext.tools.bind(this, this.onCloseOtherDropdowns));
        },

        onclickDatepickerCell: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;
            event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);

            if ( target.classList.contains('datepicker_td') ) {
                if ( target.classList.contains('-selected') || target.classList.contains('-disabled') ) return false;

                var selectedCell = this.el.querySelector('.-selected');
                if ( selectedCell ) selectedCell.classList.remove('-selected');
                target.classList.add('-selected');

                var day = target.innerHTML;
                var monthStr = (+this.month + 1) + '';
                var selectedStrDate = (day = (day.length === 1)? ('0' + day) : day )  + '.' +
                                    (monthStr = (monthStr.length === 1)? '0' + monthStr : monthStr) + '.' +
                                    this.year;
                this.selectedDate = new Date(this.year, this.month, parseInt(day, 10));
                this.notifyAboutChanges(this.selectedDate, selectedStrDate);
                this.hide();
            }
        },

        onclickMoveCtrl: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;

            if ( target.classList.contains('datepicker_move') ) {
                (event.stopPropagation)? event.stopPropagation() : event.cancelBubble = true;

                if ( target.classList.contains('-disabled') ) return false;
                if ( target.classList.contains('_next') ) this.getNextMonth();
                if ( target.classList.contains('_prev') ) this.getPrevMonth();
            }
        },

        onCloseOtherDropdowns: function(o) {
            if (o.id === this.el.id ) return false;
            this.hide();
        }
    };

    return {
        init: function() {
            var datepickers = document.querySelectorAll('.b-datepicker');
            if ( datepickers.length !== 0 ) {
                for ( var i = 0, len = datepickers.length; i < len; i++ ) {
                    this.datepickers.push( new Datepicker({el: datepickers[i]}) );
                }
            }
        },

        datepickers: []
    }
});