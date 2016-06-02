app.register('module', 'categories', function() {
    function Categories(params) {
        this.el = params.el;
        this.parent = params.parent;
        this.main = this.el.querySelector('.categories_main');
        this.reset = this.el.querySelector('.categories_reset');

        this.en = app.en;

        this.catIdCounter = 0;
        this.grIdCounter = 0;
        this.deactivatedCategories = [];

        this.initIndicator = true;

        this.subgradeInactiveColor = '#e6e8e9';

        this.currentEl = null;

        this.initialize();
    }

    Categories.prototype = {
        constructor: Categories,

        filters: {
            cards: [],
            period: []
        },

        initialize: function() {
            this.data = this.prepareData(this.parent.jsonData);

            this.drawGroupsAndCategories(this.data);

            this.handleSubGradeWidth();
            this.changeCurrencies();
            this.handleLiBoxNameWidth();
            this.handleItemsColor(this.el.querySelectorAll('.categories_li._sub'));

            this.initIndicator = false;

            this.bindEvents();
        },

        prepareData: function(data) {
            var preparedData = {
                cashless: {
                    categories: {}
                },
                refill: {
                    categories: {}
                }
            };

            for ( var i = 0, len = data.length; i < len; i++ ) {
                    var group = data[i]['group'];
                    if ( group === 'cash' ) group = 'cashless';
                    var category = data[i]['category'];
                    var cardSum = +(data[i]['cardSum'].replace(/\s*/g, '').replace(/,/g, '.'));
                        cardSum = app.ext.tools.round(cardSum, 0); //2

                    if ( preparedData[group]['categories'][category] === undefined ) {
                        preparedData[group]['categories'][category] = [];
                        preparedData[group]['categories'][category].push(cardSum);
                    } else {
                        preparedData[group]['categories'][category][0] = app.ext.tools.round((preparedData[group]['categories'][category][0]*100 +  cardSum*100)/100, 2);
                    }
            }

            preparedData = this.setTotalForGroups(preparedData);
            preparedData = this.setPercentValuesForCategories(preparedData);
            preparedData = this.setTitleForGroups(preparedData);
            preparedData = this.parseTotalToString(preparedData);
            preparedData = this.parseCateoryValuesToString(preparedData);
            preparedData = this.addGroupCssClass(preparedData);

            return preparedData;
        },

        setTotalForGroups: function(data) {
            for ( var key in data ) {
                if ( data.hasOwnProperty(key) ) {
                    data[key]['total'] = 0;
                    for ( var k in data[key]['categories'] ) {
                        if ( data[key]['categories'].hasOwnProperty(k) ) {
                            data[key]['total'] = app.ext.tools.round((data[key]['total']*100 +  data[key]['categories'][k][0]*100) / 100, 2);
                        }
                    }
                }
            }

            return data;
        },

        setPercentValuesForCategories: function(data) {
            for ( var key in data ) {
                var arK = [];
                var arV = [];
                var sum = 0;

                if ( data.hasOwnProperty(key) ) {
                    for ( var k in data[key]['categories'] ) {
                        if ( data[key]['categories'].hasOwnProperty(k) ) {
                            if ( data[key]['total'] === 0 ) {
                                data[key]['categories'][k][1] = 0;
                            } else {
                                data[key]['categories'][k][1] = data[key]['categories'][k][0] / data[key]['total'];
                                data[key]['categories'][k][1] = app.ext.tools.round(data[key]['categories'][k][1], 2);
                                data[key]['categories'][k][1] = +( (data[key]['categories'][k][1] * 100).toFixed() );

                                arK.push(k);
                                arV.push(data[key]['categories'][k][1]);
                            }
                        }
                    }

                    if ( arV.length > 1 ) {
                        for ( var i = 0, len = arV.length - 1; i < len; i++ ) {
                            sum += arV[i];
                        }
                        data[key]['categories'][arK[arK.length - 1]][1] = 100 - sum;
                    }
                }
            }

            return data;
        },

        setTitleForGroups: function(data) {
            for ( var key in data ) {
                if ( data.hasOwnProperty(key) ) {
                    data[key]['title'] = this.parent.groupMap[key];
                }
            }

            return data;
        },

        parseTotalToString: function(data) {
            for ( var key in data ) {
                if ( data.hasOwnProperty(key) ) {
                    data[key]['total'] = app.ext.tools.numToStr(data[key]['total']);
                }
            }

            return data;
        },

        parseCateoryValuesToString: function(data) {
            for ( var key in data ) {
                if ( data.hasOwnProperty(key) ) {
                    for ( var k in data[key]['categories'] ) {
                        if ( data[key]['categories'].hasOwnProperty(k) ) {
                            data[key]['categories'][k][0] = app.ext.tools.numToStr(data[key]['categories'][k][0]);
                        }
                    }
                }
            }

            return data;
        },

        addGroupCssClass: function(data) {
            for ( var key in data ) {
                if ( data.hasOwnProperty(key) ) {
                    data[key]['cssClass'] = key;
                }
            }

            return data;
        },

        // DRAW

        drawGroupsAndCategories: function(data) {
            var groups = this.drawGroups(data);
            this.catIdCounter = 0;
            this.grIdCounter = 0;

            this.main.innerHTML = '';
            this.main.appendChild(groups);
        },

        drawGroups: function(data) {
            var ul = document.createElement('ul');
            ul.className = 'categories_ul';

            var liHtml = '';

            for ( var key in data ) {
                if ( data.hasOwnProperty(key) ) {
                    data[key]['id'] = ++this.grIdCounter;
                    data[key]['total'] = data[key]['total'].slice(0, -3);
                    data[key]['currency'] = app.cur;

                    liHtml = app.ext.tmp(document.getElementById('GroupItem').innerHTML)(data[key]);
                    ul.innerHTML += liHtml;

                    var li = ul.querySelector('.categories_li._' + data[key]['cssClass'] + '');
                    var categories = this.drawCategories(data, key);

                    var categoriesLi = categories.querySelectorAll('.categories_li._sub');
                    if ( categoriesLi.length !== 0 ) categoriesLi[categoriesLi.length - 1].classList.add('_last');

                    li.appendChild(categories);
                }
            }

            return ul;
        },

        drawCategories: function(data, key) {
            data = data[key]['categories'];
            var ul = document.createElement('ul');
            ul.className = 'categories_ul';
            var liHtml = '';

            var ar = this.prepareDataArrayForCategories(data, key);

            for ( var i = 0, len = ar.length; i < len; i++ ) {
                if ( ar[i].value === '0' ) {
                    ar[i]['display'] = 'none';
                }
                liHtml = app.ext.tmp(document.getElementById('CategoryItem').innerHTML)(ar[i]);
                ul.innerHTML += liHtml;
            }

            return ul;
        },

        prepareDataArrayForCategories: function(data, key) {
            var ar = [];

            for ( var k in data ) {
                if ( data.hasOwnProperty(k) ) {
                    var gradeWidth = this.getGradeWidth(this.data[key]['categories'][k][1]);
                    var categoryId = this.getCategoryIdByName(k);
                    var itemBg = app.catColors[categoryId];

                    var d = {
                        id: ++this.catIdCounter,
                        name: k,
                        value: data[k][0].slice(0, -3),
                        currency: app.cur,
                        sortingValue: this.data[key]['categories'][k][0],
                        gradeWidth: gradeWidth,
                        subgradeWidth: (this.initIndicator)? gradeWidth : this.getSubgradeWidth(gradeWidth, this.data[key]['categories'][k][0], data[k][0]),
                        itemBg: itemBg,
                        display: 'block'
                    };

                    ar.push(d);
                }
            }

            this.parent.sortData(ar, 'sortingValue', 'sum', true);

            return ar;
        },

        getCategoryIdByName: function(name) {
            for ( var key in app.categories ) {
                if ( app.categories.hasOwnProperty(key) ) {
                    if ( app.categories[key] === name ) return key;
                }
            }
        },

        getGradeWidth: function(data) {
            var categoryElWidth = 238;
            var gradeWidth = categoryElWidth * (data/100);
            return app.ext.tools.round(gradeWidth, 0);
        },

        getSubgradeWidth: function(parentWidth, parentValue, itValue) {
            itValue = app.ext.tools.strToNum(itValue);
            parentValue = app.ext.tools.strToNum(parentValue);

            var width = parentWidth * (itValue/parentValue);
            width = app.ext.tools.round(width, 0);
            if ( width === 0 || width === 1 ) width = 2;
            return width;
        },

        redraw: function(data) {
            var extData = app.ext.tools.extendDeep(data, []);

            for ( var i = 0, len = extData.length; i < len; i++ ) {
                extData[i] = this.passThroughCardsFilter(extData[i]);
                extData[i] = this.passThroughPeriodFilter(extData[i]);
            }

            var preparedData = this.prepareData(extData);

            this.saveDeactivatedCategories(); // сохранить неактивные категории

            this.drawGroupsAndCategories(preparedData);
            this.handleSubGradeWidth();
            this.changeCurrencies();
            this.handleLiBoxNameWidth();

            this.restoreDeactivatedCategories(); // восстановить неактивные категории
            this.handleItemsColor(this.el.querySelectorAll('.categories_li._sub'));
            this.deactivatedCategories = []; // обнулить хранилище неактивных категорий

            this.notifyAboutChanges();
        },

        passThroughPeriodFilter: function(dataItem) {
            var period = this.filters.period;
            var periodLength = period.length;
            if ( periodLength === 0 ) return dataItem;

            var dateInMs = app.ext.tools.strToDate(dataItem['date'], '.').getTime();

            if ( dateInMs >= period[0].getTime() && dateInMs <= period[1].getTime() ) {
                return dataItem;
            } else {
                dataItem['cardSum'] = '0,00';
                return dataItem;
            }
        },

        passThroughCardsFilter: function(dataItem) {
            var cards = this.filters['cards'];
            if ( cards.length === 0 ) {
                return dataItem;
            }

            for ( var i = 0, len = cards.length; i < len; i++ ) {
                if ( dataItem['cardName'] === cards[i]['cardName'] &&
                    dataItem['cardNum'].slice(15) === cards[i]['cardNum']) {
                    dataItem['cardSum'] = '0,00';
                    return dataItem;
                }

                if ( i === len - 1 ) {
                    return dataItem;
                }
            }
        },

        handleLiBoxNameWidth: function() {
            var indent = 15;
            var coreLiBoxes = this.el.querySelectorAll('.categories_li-box');
            for ( var i = 0, len = coreLiBoxes.length; i < len; i++ ) {
                if ( coreLiBoxes[i].parentNode.style.display === 'none' ) continue;
                var coreLiBox = coreLiBoxes[i],
                    lPadding = app.ext.tools.getStyle(coreLiBox).paddingLeft.slice(0, -2),
                    rPadding = app.ext.tools.getStyle(coreLiBox).paddingRight.slice(0, -2),
                    coreLiBoxName = coreLiBox.querySelector('.categories_li-name'),
                    coreLiBoxValue = coreLiBox.querySelector('.categories_li-value');

                var coreLiBoxInnerWidth = coreLiBox.clientWidth - lPadding - rPadding,
                    coreLiBoxNameWidth = coreLiBoxName.clientWidth,
                    coreLiBoxValueWidth = coreLiBoxValue.clientWidth;

                if ( (coreLiBoxInnerWidth - coreLiBoxNameWidth - coreLiBoxValueWidth) < 0 ) {
                    coreLiBoxName.style.width = (coreLiBoxInnerWidth - coreLiBoxValueWidth - indent) + 'px';
                }
            }
        },

        handleSubGradeWidth: function() {
            var subgrades = this.el.querySelectorAll('.categories_li-subgrade');
            for ( var i = 0, len = subgrades.length; i < len; i++ ) {
                subgrades[i].style.width = subgrades[i].getAttribute('data-width') + 'px';
            }
        },

        changeCurrencies: function() {
            var curFields = this.el.querySelectorAll('.categories_li-cur');
            app.ext.tools.changeCurrencies(curFields);
        },

        // NOTIFY ABOUT CHANGES

        notifyAboutChanges: function() {
            var activeCategories = this.getInactiveCategoriesArray();
            app.ext.pubsub.fireEvent('categories:changed', {categories: activeCategories});
        },

        getInactiveCategoriesArray: function() {
            var ar = [];
            var activeEls = this.el.querySelectorAll('.categories_li._sub');
            for (var i = 0, len = activeEls.length; i < len; i++ ) {
                if ( activeEls[i].classList.contains('-active') ) continue;
                var o = {group: '', category: ''};
                o['group'] = app.ext.tools.closest(activeEls[i], '_core').getAttribute('data-group');
                o['category'] = activeEls[i].querySelector('.categories_li-name').innerHTML;
                ar.push( o );
            }
            return ar;
        },

        // SAVE AND RESTORE DEACTIVATED CATEGORIES

        saveDeactivatedCategories: function() {
            var categories = this.el.querySelectorAll('.categories_li');
            for (var i = 0, len = categories.length; i < len; i++ ) {
                if ( !categories[i].classList.contains('-active') ) {
                    this.deactivatedCategories.push(categories[i].getAttribute('data-id'));
                }
            }
        },

        restoreDeactivatedCategories: function() {
            for (var i = 0, len = this.deactivatedCategories.length; i < len; i++ ) {
                var categoryLi = this.el.querySelector('[data-id="' + this.deactivatedCategories[i] + '"]');
                categoryLi.classList.remove('-active');
            }
        },

        // ACTIVATE / DEACTIVATE CATEGORIES STATE

        handleGroupState: function(el) {
            var  categories = el.querySelectorAll('.categories_li._sub');
            if ( this.checkIfAllCategoriesAreActive(categories) ) {
                this.deactivateSubCategories(categories);
                el.classList.remove('-active');
            } else {
                this.activateSubCategories(categories);
                el.classList.add('-active');
            }
        },

        handleCategoryState: function(el) {
            el.classList.toggle('-active');
            var parentCore =  app.ext.tools.closest(el, '_core');
            var categories = parentCore.querySelectorAll('.categories_li._sub');
            this.checkIfAllCategoriesAreActive(categories) ? parentCore.classList.add('-active') :
                                                                parentCore.classList.remove('-active');
        },

        handleResetState: function() {
            var  categories = this.el.querySelectorAll('.categories_li._sub');
            if ( this.checkIfAllCategoriesAreActive(categories) ) {
                this.reset.innerHTML = (this.en)? 'Reset' : 'Сбросить';
                this.reset.classList.remove('-reset');
            }
            if ( this.checkIfAllCategoriesAreInactive(categories) ) {
                this.reset.innerHTML = (this.en)? 'Activate all' : 'Активировать все';
                this.reset.classList.add('-reset');
            }
        },

        checkIfAllCategoriesAreActive: function(categories) {
            for ( var i = 0, len = categories.length; i < len; i++ ) {
                if ( !categories[i].classList.contains('-active') ) return false;
                if ( i === len - 1 ) return true;
            }
        },

        checkIfAllCategoriesAreInactive: function(categories) {
            for ( var i = 0, len = categories.length; i < len; i++ ) {
                if ( categories[i].classList.contains('-active') ) return false;
                if ( i === len - 1 ) return true;
            }
        },

        // params: 'all' or arraySub
        activateSubCategories: function(categories) {
            if ( categories === 'all' ) {
                categories = this.el.querySelectorAll('.categories_li._sub');
                this.activateAllCoreCategories();
            }
            for ( var i = 0, len = categories.length; i < len; i++ ) {
                categories[i].classList.add('-active');
            }
        },

        // params: 'all' or array
        deactivateSubCategories: function(categories) {
            if ( categories === 'all' ) {
                categories = this.el.querySelectorAll('.categories_li._sub');
                this.deactivateAllCoreCategories()
            }
            for ( var i = 0, len = categories.length; i < len; i++ ) {
                categories[i].classList.remove('-active');
            }
        },

        activateAllCoreCategories: function() {
            var cores = this.el.querySelectorAll('.categories_li._core');
            for ( var i = 0, len = cores.length; i < len; i++ ) {
                cores[i].classList.add('-active');
            }
        },

        deactivateAllCoreCategories: function() {
            var cores = this.el.querySelectorAll('.categories_li._core');
            for ( var i = 0, len = cores.length; i < len; i++ ) {
                cores[i].classList.remove('-active');
            }
        },

        activateOnlyOneCategoryByName: function(name) {
            var categoriesNames = this.el.querySelectorAll('.categories_li-name');
            for ( var i = 0, len = categoriesNames.length; i < len; i++ ) {
                if ( categoriesNames[i].innerHTML === name ) {
                    app.ext.tools.closest(categoriesNames[i], 'categories_li').classList.add('-active');
                    app.ext.tools.closest(categoriesNames[i], '_core').classList.remove('-active');
                }
            }
        },

        // HANDLE ITEMS COLORS

        handleItemsColor: function(items) {
            for ( var i = 0, len = items.length; i < len; i++ ) {
                this.handleItemColor(items[i]);
            }
        },

        handleItemColor: function(item, hoverStr) {
            var itemBg = item.getAttribute('data-item-bg');

            var gradeEl = item.querySelector('.categories_li-grade');
            var subgradeBorderEl = item.querySelector('.categories_li-subgrade-border');
            var subgradeEl = item.querySelector('.categories_li-subgrade');
            var fullWidthEl = item.querySelector('.categories_li-full-width');

            if ( item.classList.contains('-active') && !hoverStr ) {
                gradeEl.style.backgroundColor = subgradeEl.style.backgroundColor =
                    subgradeBorderEl.style.backgroundColor = itemBg;
                fullWidthEl.style.backgroundColor = '';
            }
            else if ( hoverStr && hoverStr === 'hover' ) {
                gradeEl.style.backgroundColor = subgradeEl.style.backgroundColor =
                    subgradeBorderEl.style.backgroundColor = fullWidthEl.style.backgroundColor = itemBg;
            }
            else {
                gradeEl.style.backgroundColor = subgradeEl.style.backgroundColor =
                    subgradeBorderEl.style.backgroundColor = this.subgradeInactiveColor;
                fullWidthEl.style.backgroundColor = '';
            }
        },

        bindEvents: function() {
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickLiBox));
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickLiReset));
            app.ext.tools.addListener(this.el, 'mouseover', app.ext.tools.bind(this, this.onmouseoverItem));
            app.ext.tools.addListener(this.el, 'mouseout', app.ext.tools.bind(this, this.onmouseoutItem));

            app.ext.pubsub.addListener('cardsFilter:changed', app.ext.tools.bind(this, this.onCardsFilterChange));
            app.ext.pubsub.addListener('period:changed', app.ext.tools.bind(this, this.onPeriodChange));
            app.ext.pubsub.addListener('category:selected', app.ext.tools.bind(this, this.onCategorySelected));
        },

        onclickLiBox: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;
            var closest = app.ext.tools.closest(target, 'categories_li');

            if ( closest !== null ) {
                var el = closest;
                if ( el.classList.contains('_core') ) {
                    this.handleGroupState(el);
                } else if ( el.classList.contains('_sub') ) {
                    this.handleCategoryState(el);
                }
                this.handleResetState();
                this.handleItemsColor(this.el.querySelectorAll('.categories_li._sub'));
                this.notifyAboutChanges();
            }
        },

        onclickLiReset: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;

            if ( target.classList.contains('categories_reset') ) {
                if ( target.classList.contains('-reset') ) {
                    this.activateSubCategories('all');
                    target.classList.remove('-reset');
                    target.innerHTML = (this.en)? 'Reset' : 'Сбросить';
                } else {
                    this.deactivateSubCategories('all');
                    target.classList.add('-reset');
                    target.innerHTML = (this.en)? 'Activate all' : 'Активировать все';
                }
                this.handleItemsColor(this.el.querySelectorAll('.categories_li._sub'));
                this.notifyAboutChanges();
            }
        },

        onmouseoverItem: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;

            if ( this.currentEl ) return false;

            while (target != this.el) {
                if (target.classList.contains('categories_li') && target.classList.contains('_sub')) break;
                target = target.parentNode;
            }

            if ( target == this.el ) return false;

            this.currentEl = target;
            this.handleItemColor(this.currentEl, 'hover');
        },

        onmouseoutItem: function(e) {
            var event = e || window.event;
            event.relatedTarget = event.relatedTarget || event.toElement;

            if ( !this.currentEl ) return false;
            var relatedTarget = event.relatedTarget;

            if ( relatedTarget && app.ext.tools.closest(relatedTarget, 'b-categories') !== null ) {
                while (relatedTarget != this.el) {
                    if (relatedTarget == this.currentEl) return false;
                    relatedTarget = relatedTarget.parentNode;
                }
            }

            this.handleItemColor(this.currentEl);
            this.currentEl = null;
        },

        onCardsFilterChange: function(o) {
            this.filters['cards'] = o.cards;
            this.redraw(this.parent.jsonData);
        },

        onPeriodChange: function(o) {
            this.filters['period'] = o.period;
            this.redraw(this.parent.jsonData);
        },

        onCategorySelected: function(o) {
            var catName = o.category;
            this.deactivateSubCategories('all');
            this.activateOnlyOneCategoryByName(catName);
            this.handleItemsColor(this.el.querySelectorAll('.categories_li._sub'));
            this.notifyAboutChanges();
        }
    };

    return {
        init: function() {
            var categories = document.querySelector('.b-categories');
            if ( categories !== null ) {
                app.module.categories = new Categories({el: categories, parent: app.module.history});
            }
        }
    }
});