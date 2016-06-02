app.register('module', 'balance', function() {
    function Balance(params) {
        this.el = params.el;
        this.startDate = this.el.querySelector('.js-start-date');
        this.endDate = this.el.querySelector('.js-end-date');

        this.en = app.en;


        this.initialize();
    }

    Balance.prototype = {
        constructor: Balance,

        initialize: function() {
            this.setDatesToBalance();
            //this.handleBalanceDates();
        },

        setDatesToBalance: function() {
            var strStartDate = app.ext.tools.dateToStr(app.periodStartDate, '.');
            var strEndDate = app.ext.tools.dateToStr(app.periodEndDate, '.');

            this.startDate.innerHTML = (this.en)? app.ext.tools.dateStrToStrWithFullMonth(strStartDate, 'en') :
                app.ext.tools.dateStrToStrWithFullMonth(strStartDate, 'ru');

            this.endDate.innerHTML = (this.en)? app.ext.tools.dateStrToStrWithFullMonth(strEndDate, 'en') :
                app.ext.tools.dateStrToStrWithFullMonth(strEndDate, 'ru');
        },

        handleBalanceDates: function() {
            var balanceDates = this.el.querySelectorAll('.js-date');

            for ( var i = 0, len = balanceDates.length; i < len; i++ ) {
                var balanceDateEl = balanceDates[i],
                    balanceDateValue = app.ext.tools.trim(balanceDateEl.innerHTML);

                balanceDateEl.innerHTML = (this.en)? app.ext.tools.dateStrToStrWithFullMonth(balanceDateValue, 'en') :
                                                        app.ext.tools.dateStrToStrWithFullMonth(balanceDateValue, 'ru');
            }
        }
    };

    return {
        init: function() {
            var balance = document.querySelector('.b-balance');
            if ( balance !== null ) {
                new Balance({el: balance});
            }
        }
    }
});