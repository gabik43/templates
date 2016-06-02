app.register('module', 'card-info', function() {
    function CardInfo(params) {
        this.el = params.el;

        this.initialize();
    }

    CardInfo.prototype = {
        constructor: CardInfo,

        initialize: function() {
            if ( !app.ext['browser-type'].ie8 ) this.changeCurrencies();
            this.modifyCreditRate();
        },

        changeCurrencies: function() {
            var curField = this.el.querySelector('._currency');
            if ( curField ) {
                curField.innerHTML = '';
                curField.classList.add('_rub');
            }
        },

        modifyCreditRate: function() {
            var rate = this.el.querySelector('.js-rate');
            if ( rate ) {
                var rateValue = rate.innerHTML;
                rateValue = rateValue.replace(/,00$/, '').replace(/(,[1-9])0$/, '$1');
                rate.innerHTML = rateValue;
            }
        }
    };

    return {
        init: function() {
            var cardInfo = document.querySelector('.b-card-info');
            if ( cardInfo !== null ) {
                new CardInfo({el: cardInfo});
            }
        }
    }
});