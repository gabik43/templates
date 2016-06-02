app.register('module', 'history', function() {
    function History(params) {
        this.el = params.el;
        this.dataEl = document.getElementById('HistoryData');
        this.titleText = this.el.querySelector('.history_title-text');
        this.dataSplitter = '&lt;-&gt;';

        this.en = app.en;

        this.initialize();
    }

    History.prototype = {
        constructor: History,

        initialize: function() {
            this.setGroupMap();

            var data = this.getData();

            this.jsonData = this.parseDataToJson(data);
            this.sortData(this.jsonData, 'date', 'date', true);
            this.jsonData = this.repairDeviationDates(this.jsonData);

            this.dataEl.parentNode.removeChild(this.dataEl);
        },

        setGroupMap: function() {
            this.groupMap = {};
            this.groupMap['cashless'] = (this.en)? 'Expenses' : 'Расходы';
            this.groupMap['cash'] = (this.en)? 'Cash withdrawn' : 'Снятие наличных';
            this.groupMap['refill'] = (this.en)? 'Incomes' : 'Пополнения';
        },

        getData: function() {
            var headers = document.getElementById('HistoryHeaders').innerHTML;
            var headersAr = headers.split(this.dataSplitter);
            var trs = this.dataEl.querySelectorAll('.h_item');
            return {trs: trs, headers: headersAr};
        },

        parseDataToJson: function(data) {
            var ar = [];
            for ( var i = 0, len = data.trs.length; i < len; i++ ) {
                var trAr = data.trs[i].innerHTML.split(this.dataSplitter);
                var headersAr = data.headers;
                var jsonItem = this.createJSONItem(trAr, headersAr);
                jsonItem['id'] = (i + 1) + '';
                jsonItem = this.translateMCCForCategory(jsonItem);
                jsonItem['cardSum'] = jsonItem['cardSum'].replace(/&nbsp;/g, ' ');
                jsonItem['frnSum'] = jsonItem['frnSum'].replace(/&nbsp;/g, ' ');
                ar.push(jsonItem);
            }
            return ar;
        },

        createJSONItem: function(trAr, headersAr) {
            var o = {};
            for ( var i = 0, len = headersAr.length; i < len; i++ ) {
                var header = app.ext.tools.trim(headersAr[i]);
                o[header] = app.ext.tools.trim(trAr[i]);
            }
            return o;
        },

        translateMCCForCategory: function(item) {
            if ( item.group == 'refill' ) {
                item.category += '+';
            } else {
                item.category += '-';
            }

            var category = app.categories[app.mcc[item.category]];
            if ( !category ) {
                if ( item.group == 'refill' ) {
                    category = (this.en)? 'Other incomes' : 'Прочие пополнения';
                } else {
                    category = (this.en)? 'Other expenses' : 'Прочие расходы';
                }
            }
            item.category = category;

            return item;
        },

        repairDeviationDates: function(data) {
            for ( var i = 0, len = data.length; i < len; i++ ) {
                var dataItemDate = app.ext.tools.strToDate(data[i]['date'], '.');
                if ( dataItemDate.getTime() < app.periodStartDate.getTime() ) {
                    data[i]['showDate'] = data[i]['date'];
                    data[i]['date'] = this.removeStartYearNumbers(app.ext.tools.dateToStr(app.periodStartDate, '.'), '.');
                }
                else if ( dataItemDate.getTime() > app.periodEndDate.getTime() ) {
                    data[i]['showDate'] = data[i]['date'];
                    data[i]['date'] = this.removeStartYearNumbers(app.ext.tools.dateToStr(app.periodEndDate, '.'), '.');
                }
            }

            return data;
        },

        removeStartYearNumbers: function(dateStr, splitter) {
            var ar = dateStr.split(splitter);
            ar[2] = ar[2].slice(2);
            return ar.join(splitter);
        },

        sortData: function(data, sortAttr, comparatorName, reverseFlag) {
            function dateComparator(a, b) {
                var a1 = (app.ext.tools.strToDate(a[sortAttr], '.')).getTime();
                var b1 = (app.ext.tools.strToDate(b[sortAttr], '.')).getTime();
                return (!reverseFlag)? a1 - b1 : b1 - a1;
            }

            function numComparator(a, b) {
                var a1 = app.ext.tools.strToNum(a[sortAttr]);
                var b1 = app.ext.tools.strToNum(b[sortAttr]);
                return (!reverseFlag)? a1 - b1 : b1 - a1;
            }

            if ( comparatorName === 'date' ) data.sort(app.ext.tools.bind(this, dateComparator));
            else if ( comparatorName === 'sum' ) data.sort(app.ext.tools.bind(this, numComparator));

            return data;
        }
    };

    return {
        init: function() {
            var history = document.querySelector('.b-history');
            if ( history !== null ) {
                app.module.history = new History({el: history});
            }
        }
    }
});