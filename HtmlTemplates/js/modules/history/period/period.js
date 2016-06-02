app.register('module', 'period', function() {
    function Period(params) {
        this.el = params.el;
        this.parent = params.parent;

        this.en = app.en;

        this.startEl = document.getElementById('StartPeriodItem');
        this.endEl = document.getElementById('EndPeriodItem');

        this.initialize();
    }

    Period.prototype = {
        constructor: Period,

        initialize: function() {
            this.setMinMaxDates();
            this.setDatesToDatepickers();
            this.bindEvents();
        },

        setMinMaxDates: function() {
            this.startEl.innerHTML = this.getDateStrWithFullMonth(app.periodStartDate);
            this.endEl.innerHTML = this.getDateStrWithFullMonth(app.periodEndDate);

            this.dateMin = app.ext.tools.dateToStr(app.periodStartDate, '.');
            this.dateMax = app.ext.tools.dateToStr(app.periodEndDate, '.');
        },

        setDatesToDatepickers: function() {
            this.startDatepicker = this.startEl.parentNode.querySelector('.b-datepicker');
            this.startDatepicker.setAttribute('data-min', this.dateMin);
            this.startDatepicker.setAttribute('data-max', this.dateMax);

            this.endDatepicker = this.endEl.parentNode.querySelector('.b-datepicker');
            this.endDatepicker.setAttribute('data-max', this.dateMax);
            this.endDatepicker.setAttribute('data-min', this.dateMin);
        },

        notifyAboutChanges: function() {
            var startElData = this.turnNullBackToDate(this.startEl.innerHTML);
            var endElData = this.turnNullBackToDate(this.endEl.innerHTML);

            var dateMin = (this.en)? app.ext.tools.strWithFullMonthToDate(startElData, 'en') :
                                    app.ext.tools.strWithFullMonthToDate(startElData, 'ru');
            var dateMax = (this.en)? app.ext.tools.strWithFullMonthToDate(endElData, 'en'):
                                    app.ext.tools.strWithFullMonthToDate(endElData, 'ru');

            var minFlag = ( dateMin.getTime() === app.ext.tools.strToDate(this.dateMin, '.').getTime() );
            var maxFlag = ( dateMax.getTime() === app.ext.tools.strToDate(this.dateMax, '.').getTime() );

            app.ext.pubsub.fireEvent('period:changed', {period: [dateMin, dateMax]});
            app.ext.pubsub.fireEvent('chart-pointers:move', {period: [dateMin, dateMax], dateMin: minFlag, dateMax: maxFlag});
        },

        getDateStrWithFullMonth: function(date) {
            if ( typeof date !== 'string' ) date = app.ext.tools.dateToStr(date, '.');

            var dateStr = (this.en)?
                app.ext.tools.dateStrToStrWithFullMonth(date, 'en'):
                app.ext.tools.dateStrToStrWithFullMonth(date, 'ru');

            if ( dateStr.charAt(0) === '0' ) dateStr = dateStr.slice(1);

            return dateStr;
        },

        turnNullBackToDate: function(dateStr) {
            var ar = dateStr.split(' ');
            if ( ar[0].length === 1 ) dateStr = '0' + dateStr;
            return dateStr;
        },

        bindEvents: function() {
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickItem));
            app.ext.tools.addListener(app.el, 'click', app.ext.tools.bind(this, this.hideDatepickers));

            app.ext.pubsub.addListener('date:' + this.startEl.id + ':changed', app.ext.tools.bind(this, this.onStartDateChange));
            app.ext.pubsub.addListener('date:' + this.endEl.id + ':changed', app.ext.tools.bind(this, this.onEndDateChange));
            app.ext.pubsub.addListener('chart-pointers:moved', app.ext.tools.bind(this, this.onPointersMoved));
            app.ext.pubsub.addListener('datepicker:hidden', app.ext.tools.bind(this, this.onDatepickerHidden));
            app.ext.pubsub.addListener('datepicker:shown', app.ext.tools.bind(this, this.onDatepickerShown));
        },

        onclickItem: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;
            if ( target.classList.contains('period_item-name') ) {
                (event.stopPropagation)? event.stopPropagation() : event.cancelBubble = true;
                var targetText = this.turnNullBackToDate(target.innerHTML);
                var date = (this.en)?  app.ext.tools.strWithFullMonthToDateStr(targetText, 'en') :
                                        app.ext.tools.strWithFullMonthToDateStr(targetText, 'ru');

                app.ext.pubsub.fireEvent('datepicker:' + target.id + ':show', {date: date});
            }
        },

        hideDatepickers: function() {
            app.ext.pubsub.fireEvent('datepicker:' + this.startEl.id + ':hide');
            app.ext.pubsub.fireEvent('datepicker:' + this.endEl.id + ':hide');
        },

        onStartDateChange: function(o) {
            this.startEl.innerHTML = this.getDateStrWithFullMonth(o.dateStr);
            this.startEl.classList.remove('-active');
            this.endDatepicker.setAttribute('data-min', o.dateStr);

            this.notifyAboutChanges();
        },

        onEndDateChange: function(o) {
            this.endEl.innerHTML = this.getDateStrWithFullMonth(o.dateStr);
            this.endEl.classList.remove('-active');
            this.startDatepicker.setAttribute('data-max', o.dateStr);

            this.notifyAboutChanges();
        },

        onPointersMoved: function(o) {
            var startStrDate = app.ext.tools.dateToStr(o.period[0], '.');
            var endStrDate = app.ext.tools.dateToStr(o.period[1], '.');

            this.startEl.innerHTML = this.getDateStrWithFullMonth(startStrDate);
            this.endEl.innerHTML = this.getDateStrWithFullMonth(endStrDate);

            this.endDatepicker.setAttribute('data-min', startStrDate);
            this.startDatepicker.setAttribute('data-max', endStrDate);
        },

        onDatepickerHidden: function(o) {
            document.getElementById(o.elId).classList.remove('-active');
        },

        onDatepickerShown: function(o) {
            document.getElementById(o.elId).classList.add('-active');
        }
    };

    return {
        init: function() {
            var period = document.querySelector('.b-period');
            if ( period !== null ) {
                app.module.period = new Period({el: period, parent: app.module.history});
            }
        }
    }
});