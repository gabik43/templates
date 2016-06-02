app.register('module', 'cards-filter', function() {
    function CardsFilter(params) {
        this.el = params.el;
        this.parent = params.parent;
        this.title = this.el.querySelector('.cards-filter_title');

        this.en = app.en;

        this.cardsLength = null;

        this.itemsWithoutScroll = 6;

        this.initialize();
    }

    CardsFilter.prototype = {
        constructor: CardsFilter,

        initialize: function() {
            this.getMaxDate();
            this.data = this.prepareData();
            this.drawCardsFilter(this.data);

            this.bindEvents();
        },

        getMaxDate: function() {
            this.dateMax = app.periodEndDate;
        },

        prepareData: function() {
            var data = this.parent.jsonData,
            ar = [],
            o = {},
            counter = 0;

            for ( var i = 0, len = data.length; i < len; i++ ) {
                // todo: spiridovich-ai: название карты никак не уникально!
                // карты с одинаковым имененем затирают друг друга.
                // заменил на маскированный номер карты (тоже не лучший вариант)
                o[data[i]['cardNum']] = {
                    cardType: data[i]['cardType'],
                    cardName: data[i]['cardName']
                };
            }

            for ( var cardNum in o ) {
                if (o.hasOwnProperty(cardNum) ) {
                    counter++;
                    var card = {};
                    card['cardId'] = 'Card' + counter;
                    card['cardName'] = o[cardNum]['cardName'];
                    card['cardBlocked'] = this.checkIfCardIsBlocked(o[cardNum]['cardName'], cardNum);
                    card['cardNum'] = cardNum.slice(12).replace(/X/g, '&bull;');
                    card['cardType'] = (o[cardNum]['cardType'] === 'O')? 'Основная' : 'Дополнительная';
                    ar.push(card);
                }
            }

            return ar;
        },

        checkIfCardIsBlocked: function(cardName, cardNum) {
            cardNum = cardNum.replace(/\s+/g, '').replace(/X/g, '');
            var blockList = app.blockedCards;
            if ( !blockList ) return false;
            for ( var i = 0, len = blockList.length; i < len; i++ ) {
                if ( blockList[i]['cardName'] === cardName && blockList[i]['cardNumber'] === cardNum ) return true;
            }
            return false;
        },

        drawCardsFilter: function(data) {
            if ( data.length === 1 ) {
                this.el.classList.add('_single');
                this.title.innerHTML = 'по карте ' + data[0]['cardNum'];
                this.title.style.cssText = 'border-bottom: 0; cursor: default';
            } else {
                this.dropdown = this.drawCardsFilterDropdown(data);
                this.el.appendChild(this.dropdown);

                // defs
                this.items = this.el.querySelectorAll('.cards-filter_item');
                this.checkboxes = this.el.querySelectorAll('.cards-filter_checkbox');
                this.switcher = this.el.querySelector('.cards-filter_switcher');
                this.switcherText = this.el.querySelector('.cards-filter_switcher-text');
            }
        },

        drawCardsFilterDropdown: function(data) {
            var dd = document.createElement('div');
            dd.className = 'cards-filter_dropdown';
            dd.innerHTML = document.getElementById('CardsFilterDropdown').innerHTML;

            var itemsContainer = dd.querySelector('.cards-filter_items-wrapper');
            itemsContainer.innerHTML = this.drawCardsFilterDropdownItems(data);

            return dd;
        },

        drawCardsFilterDropdownItems: function(data) {
            var items = '',
                len = data.length;
            for ( var i = 0; i < len; i++ ) {
                items += app.ext.tmp(document.getElementById('CardsFilterItem').innerHTML)(data[i]);
            }
            this.cardsLength = len;
            return items;
        },

        notifyAboutChanges: function(activeCards) {
            app.ext.pubsub.fireEvent('cardsFilter:changed', {cards: activeCards});
        },

        changeTitle: function(activeCards) {
            if ( activeCards.length === this.data.length ) {
                this.title.innerHTML = (this.en)? 'by all cards' : 'по всем картам';
            }
            else if ( activeCards.length > 6 ) {
                this.title.innerHTML = (this.en)? 'by ' + activeCards.length +  ' cards' : 'по ' + activeCards.length +  ' картам';
            }
            else if ( activeCards.length === 5 ) {
                this.title.innerHTML = (this.en)? 'by five cards' : 'по пяти картам';
            }
            else if ( activeCards.length === 4 ) {
                this.title.innerHTML = (this.en)? 'by four cards' : 'по четырем картам';
            }
            else if ( activeCards.length === 3 ) {
                this.title.innerHTML = ((this.en)? 'by cards ' : 'по картам: ') + '&bull;&bull;&nbsp;' + activeCards[0]['cardNum'] + ', ' +
                '&bull;&bull;&nbsp;' + activeCards[1]['cardNum'] + ' и ' + '&bull;&bull;&nbsp;' + activeCards[2]['cardNum'];
            }
            else if ( activeCards.length === 2 ) {
                this.title.innerHTML = ((this.en)? 'by cards ' : 'по картам: ') + '&bull;&bull;&nbsp;' + activeCards[0]['cardNum'] + ' и ' +
                '&bull;&bull;&nbsp;' + activeCards[1]['cardNum'];
            }
            else if ( activeCards.length === 1 ) {
                this.title.innerHTML = ((this.en)? 'by card ' : 'по карте: ') + '&bull;&bull;&nbsp;' + activeCards[0]['cardNum'];
            }
            else if ( activeCards.length === 0 ) {
                this.title.innerHTML = (this.en)? '... ups, select the card :)' : '... ой, выберите карту :)';
            }
        },

        scanForActiveCards: function() {
            var ar = [];
            var checkboxes = this.checkboxes;
            for ( var i = 0, len = checkboxes.length; i < len; i++ ) {
                if ( checkboxes[i].checked === true ) {
                    var o = {
                        cardName: checkboxes[i].parentNode.querySelector('.cards-filter_card-name').innerHTML,
                        cardNum: checkboxes[i].parentNode.querySelector('.cards-filter_card-num').innerHTML.slice(3)
                    };
                    ar.push(o);
                }
            }
            return ar;
        },

        scanForInactiveCards: function() {
            var ar = [];
            var checkboxes = this.checkboxes;
            for ( var i = 0, len = checkboxes.length; i < len; i++ ) {
                if ( checkboxes[i].checked === false ) {
                    var o = {
                        cardName: checkboxes[i].parentNode.querySelector('.cards-filter_card-name').innerHTML,
                        cardNum: checkboxes[i].parentNode.querySelector('.cards-filter_card-num').innerHTML.slice(3)
                    };
                    ar.push(o);
                }
            }
            return ar;
        },

        handleSwitcherState: function(activeCards) {
            var activeCardsLength = activeCards.length;
            if ( activeCardsLength < this.cardsLength ) {
                this.switcher.classList.add('_check-all');
                this.switcherText.innerHTML = (this.en)? 'Check all' : 'Выбрать все';
            } else if ( activeCardsLength === this.cardsLength ) {
                this.switcher.classList.remove('_check-all');
                this.switcherText.innerHTML = (this.en)? 'Reset all' : 'Сбросить выбор';
            }
        },

        showDropdown: function() {
            this.dropdown.style.display = 'block';
            this.handleDropdownScroll();

            app.ext.pubsub.fireEvent('close-other-dropdowns', {id: this.el.id});
            app.historyDropdownOpened = true;
        },

        hideDropdown: function() {
            if (this.dropdown !== undefined) {
                if ( this.dropdown.style.display = 'block' ) {
                    this.dropdown.style.display = 'none';
					// todo: spiridovich-ai: при установке el.style.width = X,
					// будет el.clientWidth === X, каждый раз при открытии дропдауна
					// увеличивается el.clientWidth на scrollWidth, в итоге ширина дропдауна
					// со скроллом постоянно растет. Исправил очисткой this.dropdown.style.width
					// при закрытии дропдауна.
					this.dropdown.style.width = '';
                    this.el.querySelector('.cards-filter_title').classList.remove('-active');
                }
            }
            app.historyDropdownOpened = false;
        },

        handleDropdownScroll: function() {
            var itemsWrapper = this.el.querySelector('.cards-filter_items-wrapper');
            var items = this.el.querySelectorAll('.cards-filter_item ');
            var itemsLength = items.length;
            if ( itemsLength >  this.itemsWithoutScroll ) {
                var itemHeight = items[0].offsetHeight;
                itemsWrapper.style.height = (itemHeight *  this.itemsWithoutScroll) + 'px';
                itemsWrapper.style.overflow = 'auto';
                this.incDropdownWidth();
            }
        },

        incDropdownWidth: function() {
            var scrollWidth = app.ext.tools.scrollBarWidth;
            var dd = this.el.querySelector('.cards-filter_dropdown');
            dd.style.width = (dd.clientWidth + scrollWidth) + 'px';
        },

        activateAllItems: function() {
            for ( var i = 0, len = this.items.length; i < len; i++ ) {
                this.items[i].classList.add('-active');
                this.checkboxes[i].checked = true;
            }
        },

        deactivateAllItems: function() {
            for ( var i = 0, len = this.items.length; i < len; i++ ) {
                this.items[i].classList.remove('-active');
                this.checkboxes[i].checked = false;
            }
        },

        bindEvents: function() {
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickTitle));
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickCheckbox));
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickSwitcher));
            app.ext.tools.addListener(app.el, 'click', app.ext.tools.bind(this, this.hideDropdown));

            app.ext.pubsub.addListener('close-other-dropdowns', app.ext.tools.bind(this, this.onCloseOtherDropdowns));
        },

        onclickTitle: function(e) {
            var event = e || window.event;
            event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
            var target = event.target || event.srcElement;

            if ( target.classList.contains('cards-filter_title') ) {
                if ( this.el.classList.contains('_single') ) return false;
                if ( !target.classList.contains('-active') ) {
                    target.classList.add('-active');
                }
                this.showDropdown();
            }
        },

        onclickCheckbox: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;

            if ( target.classList.contains('cards-filter_checkbox') ) {
                target.parentNode.classList.toggle('-active');

                var activeCards = this.scanForActiveCards();
                var inactiveCards = this.scanForInactiveCards();
                this.handleSwitcherState(activeCards);
                this.changeTitle(activeCards);
                this.notifyAboutChanges(inactiveCards);
            }
        },

        onclickSwitcher: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;
            var closest = app.ext.tools.closest(target, 'cards-filter_switcher');

            if ( target.classList.contains('cards-filter_switcher') || closest !== null ) {
                if ( closest ) target = closest;

                if ( target.classList.contains('_check-all') ) {
                    target.classList.remove('_check-all');
                    this.switcherText.innerHTML = 'Сбросить выбор';
                    this.activateAllItems();
                } else {
                    target.classList.add('_check-all');
                    this.switcherText.innerHTML = 'Выбрать все';
                    this.deactivateAllItems();
                }

                var activeCards = this.scanForActiveCards();
                var inactiveCards = this.scanForInactiveCards();
                this.changeTitle(activeCards);
                this.notifyAboutChanges(inactiveCards);
            }
        },

        onCloseOtherDropdowns: function(o) {
            if (o.id === this.el.id ) return false;
            this.hideDropdown();
        }
    };

    return {
        init: function() {
            var cardsFilter = document.querySelector('.b-cards-filter');
            if ( cardsFilter !== null ) {
                app.module.cardsFilter = new CardsFilter({el: cardsFilter, parent: app.module.history});
            }
        }
    }
});