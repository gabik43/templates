app.register('module', 'extra-card', function() {
    function ExtraCard(params) {
        this.el = params.el;
        this.icon = this.el.querySelector('.extra-card_icon');
        this.paySysImg = this.el.querySelector('.extra-card_pay-system');
        this.cardNumber =  this.el.querySelector('.extra-card_item._number');
        this.cardName =  this.el.querySelector('.extra-card_item._name');
        this.validDate = this.el.querySelector('.extra-card_item._valid ._date');
        this.validText = this.el.querySelector('.extra-card_item._valid ._text');

        this.en = app.el.classList.contains('_en');

        this.initialize();
    }

    ExtraCard.prototype = {
        constructor: ExtraCard,

        initialize: function() {
            this.bindEvents();
            this.setImgSrcs();
            this.setCardBg();
            this.handleCardBlocking();
            this.replaceCardCrossesToDottes();
            this.translateValidDateMonth();
        },

        setImgSrcs: function() {
            this.paySysImg.src = this.el.querySelector('.extra-card_pay-system-src').innerHTML;
        },

        setCardBg: function() {
            var resource = this.el.querySelector('.extra-card_poster-src').innerHTML;
            var ar = resource.split('--');
            this.bgColor = ar[1];
            this.icon.style.backgroundColor = '#' + this.bgColor;
        },

        handleCardBlocking: function() {
            var validDateStr = this.validDate.innerHTML;
            var validDateFirstDay = app.ext.tools.strToDate('01.' + validDateStr, '.');
            var validDate = new Date(validDateFirstDay.getFullYear(), validDateFirstDay.getMonth() + 1, 0);

            if ( validDate.getTime() <= app.periodEndDate.getTime() ) {
                this.el.classList.add('-blocked');
                this.icon.style.opacity = .5;
                if ( app.el.classList.contains('_en') ) {
                    this.validText.innerHTML = 'Blocked';
                } else {
                    this.validText.innerHTML = 'Заблокирована в';
                }

                this.writeCardAsBlockedInApp();
            }
        },

        writeCardAsBlockedInApp: function() {
            if ( !app.blockedCards ) app.blockedCards = [];
            app.blockedCards.push({
                cardName: app.ext.tools.trim(this.cardName.innerHTML),
                cardNumber: this.cardNumber.innerHTML.replace(/X/g, '').replace(/\s+/g, '')
            });
        },

        replaceCardCrossesToDottes: function() {
            var cardNum = this.cardNumber.innerHTML;
            cardNum = app.ext.tools.trim(cardNum);
            cardNum = cardNum.replace(/\s+/g, '');
            cardNum = cardNum.slice(12);
            this.cardNumber.innerHTML = '&bull;&bull;&nbsp;' + cardNum;
        },

        translateValidDateMonth: function() {
            var dateAr = this.validDate.innerHTML.split('.');
            var month;
            if ( this.en ) {
                month = (this.el.classList.contains('-blocked'))? app.ext.tools.monthWordHashEn[dateAr[0]] :
                    app.ext.tools.monthWordHashEn[dateAr[0]];
            } else {
                month = (this.el.classList.contains('-blocked'))? app.ext.tools.monthWordHash3[dateAr[0]] :
                    app.ext.tools.monthWordHash2[dateAr[0]];
            }

            this.validDate.innerHTML = month + ((this.en)? ', ' : ' ') + dateAr[1];
        },

        bindEvents: function() {
            var self = this;
            this.paySysImg.onload = function() {
                self.paySysImg.height = Math.floor(self.paySysImg.height/2);
                self.paySysImg.width = Math.floor(self.paySysImg.width/2);

                setTimeout(function() {
                    self.paySysImg.style.marginTop = (-self.paySysImg.height/2) + 'px';
                    self.paySysImg.style.marginLeft = (-self.paySysImg.width/2) + 'px';
                }, 100);
            };
            this.paySysImg.onerror = function() {
                self.paySysImg.parentNode.removeChild(self.paySysImg);
            };

            //app.ext.pubsub.addListener('extra-cards:opened-first-time', app.ext.tools.bind(this, this.onInfoOpen));
        }

        //onInfoOpen: function() {
        //    this.paySysImg.height = Math.floor(this.paySysImg.height / 2);
        //    var self= this;
        //    setTimeout(function() {
        //        self.paySysImg.style.marginTop = (-self.paySysImg.height/2) + 'px';
        //        self.paySysImg.style.marginLeft = (-self.paySysImg.width/2) + 'px';
        //    }, 40);
        //}
    };

    return {
        init: function() {
            var extraCards = document.querySelectorAll('.b-extra-card');
            if ( extraCards !== null ) {
                for ( var i = 0, len = extraCards.length; i < len; i++ ) {
                    new ExtraCard({el: extraCards[i]});
                }
            }
        }
    }
});