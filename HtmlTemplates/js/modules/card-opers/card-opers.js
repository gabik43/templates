app.register('module', 'card-opers', function() {
    function CardOpers(params) {
        this.el = params.el;
        this.items = this.el.querySelectorAll('.card-opers_item');
        this.bonusContainer = this.el.querySelector('.card-opers_bonus');

        this.initialize();
    }

    CardOpers.prototype = {
        constructor: CardOpers,

        initialize: function() {
            this.modOpersSums();
            if ( this.bonusContainer ) {
                this.handleBonusCell();
                this.handleBonusTotalValue();
            }
        },

        modOpersSums: function() {
            for ( var i = 0, len = this.items.length; i< len; i++ ) {
                var itemValueEl = this.items[i].querySelector('.card-opers_item-value'),
                    itemValue = app.ext.tools.trim(itemValueEl.innerHTML),
                    itemValueAr = itemValue.split(',');

                if ( itemValueAr.length === 1 ) {
                    itemValueEl.innerHTML = '<span class="_integer">' + itemValueAr[0] + '</span>';
                } else {
                    itemValueEl.innerHTML = '<span class="_integer">' + itemValueAr[0] + '</span>,<span class="_fraction">' + itemValueAr[1] + '</span>';
                }

            }
        },

        handleBonusCell: function() {
            var currency = this.bonusContainer.querySelector('.card-opers_item-currency');
            if ( currency ) {
                var value = this.bonusContainer.querySelector('.card-opers_item-value ._integer');

                if ( !app.el.classList.contains('_en') ) {
                    app.ext.tools.handleRuCase(value, currency, 'миля', 'мили', 'миль', 'мил');
                } else {
                    app.ext.tools.handleEnCase(value, currency, 'mile', 'miles', 'mil');
                }
            }
        },

        handleBonusTotalValue: function() {
            var currency = this.bonusContainer.querySelector('.card-opers_total-currency');
            if ( currency ) {
                var value = this.bonusContainer.querySelector('.card-opers_total-value');
                if ( !app.el.classList.contains('_en') ) {
                    app.ext.tools.handleRuCase(value, currency, 'бонус', 'бонуса', 'бонусов', 'бонус');
                } else {
                    app.ext.tools.handleEnCase(value, currency, 'bonus', 'bonuses', 'bonus');
                }
            }
        }
    };

    return {
        init: function() {
            var cardOpers = document.querySelector('.b-card-opers');

            if ( cardOpers !== null ) {
                    new CardOpers({el: cardOpers});
            }
        }
    }
});