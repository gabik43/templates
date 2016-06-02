app.register('module', 'card', function() {
    function Card(params) {
        this.el = params.el;
        this.cardNumber = this.el.querySelector('.card_number');
        this.cardPosterSrc = this.el.querySelector('.card_poster-src');
        this.posterImg = this.el.querySelector('.card_poster');
        this.partnerImg = this.el.querySelector('.card_partnership');
        this.paysysImg = this.el.querySelector('.card_pay-system');
        this.cardCurrencyEl = this.el.querySelector('.card_currency-value');

        this.cardName = this.el.querySelector('.card_name');
        this.expiryVal = this.el.querySelector('.card_expiry-value');

        this.initialize();
    }

    Card.prototype = {
        constructor: Card,

        cur: {
            USD: '$',
            GBP: '£',
            EUR: '€',
            JPY: '¥',
            CNY: '¥'
        },

        initialize: function() {
            this.bindEvents();
            if ( app.ext['browser-type'].webkit && this.el.classList.contains('_small') ) {
                this.adaptSmallLabelsToWebkit();
            }
            this.setMainCardCurrencyToApp();
            this.setImgSrcs();
            this.setCardColorAndBg();
            this.replaceCardCrossesToDottes();
            this.changeCurrencies();
        },

        setMainCardCurrencyToApp: function() {
            app.cur = app.ext.tools.trim(this.cardCurrencyEl.innerHTML.toLowerCase());
        },

        setImgSrcs: function() {
            this.posterImg.src = this.el.querySelector('.card_poster-src').innerHTML;

            var partnershipSrc = this.el.querySelector('.card_partnership-src');
            if ( partnershipSrc && partnershipSrc !== '' ) {
                this.partnerImg.src = partnershipSrc.innerHTML;
            } else {
                this.partnerImg.style.display = 'none';
            }

            this.el.querySelector('.card_pay-system').src = this.el.querySelector('.card_pay-system-src').innerHTML;
        },

        setCardColorAndBg: function() {
            var src = this.cardPosterSrc.innerHTML,
                srcSpliced = src.slice(0, -4);
            var srcAr = srcSpliced.split('--');
            var bg, color;
            if ( this.el.classList.contains('_main') ) {
                app.mainCardBG = bg = srcAr[1];
                app.mainCardColor = color = srcAr[2];
            } else {
                bg = srcAr[1];
                color = srcAr[2];
            }
            if ( color === 'white' ) this.el.classList.add('_white');
            if ( !(this.el.style.backgroundColor === 'transparent') ) {
                this.el.style.backgroundColor = '#' + bg;
            }
        },

        replaceCardCrossesToDottes: function() {
            var cardNumVal = this.cardNumber.innerHTML.replace(/\s/g, '');
            var cardNumParts = this.getCardNumParts(cardNumVal);
            var cardNumHtml = this.getCardNumPartsHtml(cardNumParts);
            this.cardNumber.innerHTML = cardNumHtml.replace(/X/g, '&bull;');
            this.cardNumber.classList.add('_l' + cardNumVal.length);
        },

        getCardNumParts: function(val) {
            var ar = [];

            ar.push(val.slice(0, 4));
            ar.push(val.slice(4, 8));
            ar.push(val.slice(8, 12));
            ar.push(val.slice(12));

            return ar;
        },

        getCardNumPartsHtml: function(ar) {
            var html = '';
            for ( var i = 0, len = ar.length; i < len; i++ ) {
               html += '<div class="card_number-item">' + ar[i] + '</div>';
            }
            return html;
        },

        changeCurrencies: function() {
            var curField = this.cardCurrencyEl,
                curFieldVal = app.ext.tools.trim(curField.innerHTML);
            if ( (curFieldVal.toLowerCase() === 'rub' || curFieldVal.toLowerCase() === 'rur') && !app.ext['browser-type'].ie8 ) {
                curField.innerHTML = '';
                curField.classList.add('_rub');
            }
            else if ( this.cur[curFieldVal] !== undefined ) {
                curField.innerHTML = this.cur[curFieldVal]
            }
        },

        adaptSmallLabelsToWebkit: function() {
            var cardExpiryLabel = this.el.querySelector('.card_expiry-label'),
                cardCurrencyLabel = this.el.querySelector('.card_currency-label');
            cardExpiryLabel.style.textTransform = 'none';
            cardExpiryLabel.style.fontVariant = 'small-caps';
            cardExpiryLabel.style.fontSize = '7px';
            cardCurrencyLabel.style.textTransform = 'none';
            cardCurrencyLabel.style.fontVariant = 'small-caps';
            cardCurrencyLabel.style.fontSize = '7px';
        },

        bindEvents: function() {
            var self = this;
            this.posterImg.onload = function() {
                self.el.style.backgroundColor = 'transparent';
            };
            this.posterImg.onerror = function() {
                self.posterImg.parentNode.removeChild(self.posterImg);
            };

            this.paysysImg.onload = function() {
                self.paysysImg.height = Math.floor(self.paysysImg.height / 2);
            };
            this.paysysImg.onerror = function() {
                self.paysysImg.parentNode.removeChild(self.paysysImg);
            };

            this.partnerImg.onload = function() {
                self.partnerImg.height = Math.floor(self.partnerImg.height / 2);
            };
            this.partnerImg.onerror = function() {
                self.partnerImg.parentNode.removeChild(self.partnerImg);
            };

        }
    };

    return {
        init: function() {
            var cards = document.querySelectorAll('.b-card');
            if ( cards !== null ) {
                for ( var i = 0, len = cards.length; i < len; i++ ) {
                    new Card({el: cards[i]});
                }
            }
        }
    }
});