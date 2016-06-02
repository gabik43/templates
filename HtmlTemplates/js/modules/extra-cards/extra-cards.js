app.register('module', 'extra-cards', function() {
    function ExtraCards(params) {
        this.el = params.el;
        this.info = this.el.querySelector('.extra-cards_info');
        this.items = this.el.querySelectorAll('.extra-cards_item');
        this.iconTop = this.el.querySelector('.extra-cards_icon-top');
        this.iconBottom = this.el.querySelector('.extra-cards_icon-bottom');
        this.cardsQty = this.el.querySelector('.extra-cards_cards-qty');

        this.infoTPadding = parseInt(app.ext.tools.getStyle(this.info).paddingTop);
        this.infoBPadding = parseInt(app.ext.tools.getStyle(this.info).paddingBottom);
        if ( this.items.length > 1 ) {
            this.itemTMargin = parseInt(app.ext.tools.getStyle(this.items[1]).marginTop);
        }

        this.itemsWithoutScroll = 5;

        this.firstOpen = true;

        this.initialize()
    }

    ExtraCards.prototype = {
        constructor: ExtraCards,

        initialize: function() {
            this.deleteIfNoExtraCards();
            this.setIconColors();
            this.setExtraCardsQty();
            this.bindEvents();
        },

        deleteIfNoExtraCards: function() {
            if ( this.items.length === 0 || this.items.length === 1 ) {
                this.el.remove();
                delete app.module['extra-cards'];
            }
        },

        handleScroll: function() {
            if ( this.items.length > this.itemsWithoutScroll ) {
                var itemsHeight = this.getItemsHeight();
                var itemsMargin = this.getItemsMargin();
                var infoHeight = this.infoTPadding + this.infoBPadding + itemsHeight + itemsMargin;
                this.info.style.height = infoHeight + 'px';
                this.info.style.overflow = 'auto';
            }
        },

        getItemsHeight: function() {
            var height = 0;
            for ( var i = 0; i < this.itemsWithoutScroll; i++ ) {
                height += this.items[i].offsetHeight;
            }
            return height;
        },

        getItemsMargin: function() {
            return (this.itemsWithoutScroll - 1) * this.itemTMargin;
        },

        setIconColors: function() {
            if ( app.mainCardBG && app.mainCardColor ) {
                this.iconTop.style.backgroundColor = '#' + app.mainCardBG;
                this.iconBottom.style.backgroundColor = app.ext.tools.colorLum(app.mainCardBG, -0.1);
                this.cardsQty.style.color = app.mainCardColor;
            }
        },

        setExtraCardsQty: function() {
            if ( this.items.length > 0 ) {
                this.cardsQty.innerHTML = this.items.length;
            }
        },

        showInfo: function() {
            this.el.classList.add('-active');
            this.info.style.display = 'block';
            this.handleScroll();

            if ( this.firstOpen ) {
                app.ext.pubsub.fireEvent('extra-cards:opened-first-time');
                this.firstOpen = false;
            }

            app.ext.pubsub.fireEvent('close-other-dropdowns', {id: this.el.id});
            app.historyDropdownOpened = true;
        },

        hideInfo: function() {
            this.el.classList.remove('-active');
            this.info.style.display = 'none';
            app.historyDropdownOpened = false;
        },

        bindEvents: function() {
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.clickTrigger));
            app.ext.tools.addListener(app.el, 'click', app.ext.tools.bind(this, this.hideInfo));

            app.ext.pubsub.addListener('close-other-dropdowns', app.ext.tools.bind(this, this.onCloseOtherDropdowns));
        },

        clickTrigger: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;
            event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);

            var closest = app.ext.tools.closest(target, 'extra-cards_header-text');

            if ( target.classList.contains('extra-cards_header-text') || closest !== null ) {
                if ( this.el.classList.contains('-active') ) {
                    this.el.classList.remove('-active');
                    this.hideInfo()
                } else {
                    this.showInfo()
                }
            }
        },

        onCloseOtherDropdowns: function(o) {
            if (o.id === this.el.id ) return false;
            this.hideInfo();
        }
    };

    return {
        init: function() {
            var extraCards = document.querySelector('.b-extra-cards');
            if ( extraCards !== null ) {
                new ExtraCards({el: extraCards});
            }
        }
    }
});