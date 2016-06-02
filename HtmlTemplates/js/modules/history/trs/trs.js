app.register('module', 'trs', function() {
    function Trs(params) {
        this.el = params.el;
        this.parent = params.parent;

        this.en = app.en;

        this.initIndicator = true;
        this.initialize();
    }

    Trs.prototype = {
        constructor: Trs,

        filters: {
            search: '',
            categories: [],
            cards: [],
            period: [],
            shortcuts: []
        },

        initialize: function() {
            this.data = this.prepareData();
            this.drawHistory(this.data);
            this.bindEvents();
            this.initIndicator = false;
        },
		
		getCategoryNum: function(cat_name){
			cat_name = cat_name.toLowerCase();
			
			for(var cat_num in app.categories){
				if(!app.categories.hasOwnProperty(cat_num)) continue;
				if(app.categories[cat_num].toLowerCase() == cat_name) return cat_num;
			}
		},

        prepareData: function() {
            var data = app.ext.tools.extendDeep(this.parent.jsonData, []);

            for ( var i = 0, len = data.length; i < len; i++ ) {
                data[i]['cardFullSum'] = data[i]['cardSum'];
                var int = data[i]['cardSum'].slice(0, -3),
                    fr = data[i]['cardSum'].slice(-3);
                data[i]['cardSum'] = int;
                data[i]['cardSumFr'] = fr;

                data[i]['dateOriginal'] = data[i]['date'];
                data[i]['postDateOriginal'] = data[i]['postDate'];
                data[i]['date'] = this.prepareDates(data[i]['date']);
                data[i]['postDate'] = this.prepareDates(data[i]['postDate']);
                				
				// todo: spiridovich-ai: data[i]['category'] содержит локализованное название категории
				// app.catColors = объект с Number ключами, в итоге data[i]['bgColor'] всегда undefined
				// добавил getCategoryNum, принимает имя категории, возвращает ее номер в app.categories
				
				//data[i]['bgColor'] = app.catColors[ data[i]['category'].toLocaleLowerCase() ];
				data[i]['bgColor'] = app.catColors[ this.getCategoryNum(data[i]['category']) ];
            }

            return data;
        },

        prepareDates: function(dateStr) {
            dateStr = dateStr.slice(0, -2) + '20' + dateStr.slice(-2);
            dateStr = (this.en)? app.ext.tools.dateStrToStrWithFullMonth(dateStr, 'en'): app.ext.tools.dateStrToStrWithFullMonth(dateStr, 'ru');
            if ( dateStr.charAt(0) === '0' ) dateStr = dateStr.slice(1);
            dateStr = this.cutCurrentYear(dateStr);

            return dateStr;
        },

        getDataItemById: function(id) {
            for ( var i = 0, len = this.data.length; i < len; i++ ) {
                if ( this.data[i]['id'] === id ) return app.ext.tools.extendDeep(this.data[i]);
                if ( i === len - 1  ) return null;
            }
        },

        cutCurrentYear: function(dateStr) {
            var curYear = (new Date()).getFullYear() + '';
            var yearInDateStr = dateStr.slice(-4);

            if ( curYear === yearInDateStr ) dateStr = (this.en)? app.ext.tools.trim(dateStr.slice(0, -6)) :
                                                                            app.ext.tools.trim(dateStr.slice(0, -4));

            return dateStr;
        },

        drawHistory: function(data) {
            var fragment = document.createDocumentFragment();
            var filteredData = [];

            for ( var i = 0, len = data.length; i < len; i++ ) {
                var dataItem;

                if ( this.initIndicator ) {
                    dataItem = data[i];
                } else {
                    dataItem = this.passThroughFilters(data[i]);
                }

                if ( dataItem ) {
                    filteredData.push(dataItem);
                    var el = this.drawHistoryItem(data[i]);
                    fragment.appendChild(el);
                }
            }

            app.ext.pubsub.fireEvent('shortcuts:redraw', {data: filteredData});

            this.el.innerHTML = '';
            this.el.appendChild(fragment);

            this.changeCurrencies();
        },

        drawHistoryItem: function(dataItem) {
            var el = document.createElement('div');
            el.id = dataItem['id'];
            el.className = 'trs_it _' + dataItem['group'];
            el.innerHTML = app.ext.tmp(document.getElementById('HistoryItemMain').innerHTML)(dataItem);
            return el;
        },

        passThroughFilters: function(dataItem) {
            var result;

            result = this.passThroughPeriodFilter(dataItem); // фильтр по периоду
            if ( !result ) return false;

            result = this.passThroughCategoriesFilter(dataItem); // фильтр по категориям
            if ( !result ) return false;

            result = this.passThroughSearchFilter(dataItem); // фильтр по строке поиска
            if ( !result ) return false;

            result = this.passThroughCardsFilter(dataItem); // фильтр по картам
            if ( !result ) return false;

            result = this.passThroughShortcutsFilter(dataItem); // фильтр по шорткатам
            if ( !result ) return false;

            return dataItem;
        },

        passThroughPeriodFilter: function(dataItem) {
            var period = this.filters.period;
            var periodLength = period.length;
            if ( periodLength === 0 ) return true;

            var dateInMs = app.ext.tools.strToDate(dataItem['dateOriginal'], '.').getTime();

            return !!( dateInMs >= period[0].getTime() && dateInMs <= period[1].getTime() );
        },

        passThroughCategoriesFilter: function(dataItem) {
            var categories = this.filters.categories;
            var categoriesLength = categories.length;

            if ( categoriesLength === 0 ) return true;

            for ( var i = 0; i < categoriesLength; i++ ) {
                if ( dataItem['category'] === categories[i]['category'] ) {
                    return false;
                }
                if ( i === categoriesLength - 1 ) return true;
            }
        },

        passThroughSearchFilter: function(dataItem) {
            var searchText = this.filters['search'];
            var searchAr = searchText.replace(/,\s/g, ',').split(',');

            var dataItemPrep = this.prepareDataItemForSearch(dataItem);
            var dataItemPrepFields = this.prepareDataItemFieldsArray(dataItemPrep);

            m:for ( var i = 0, len = searchAr.length; i < len; i++ ) {
                for ( var j = 0, l = dataItemPrepFields.length; j < l; j++ ) {
					
					// todo: spiridovich-ai: поиск идет по всем полям, включая bgColor
                    // который бывает undefined и при вызове .toLowerCase() скрипт падает
                    // пофиксил проверкой
                    if ( dataItemPrep[dataItemPrepFields[j]] == null ) {
                        continue;
                    }

                    if ( dataItemPrepFields[j] === 'country' && this.tryToFindStrInCountriesAr(dataItemPrep[dataItemPrepFields[j]], searchAr[i]) ) {
                        if ( i !== (len - 1) ) continue m;
                        else return true;
                    }
                    else if ( dataItemPrepFields[j] === 'city' && this.tryToFindStrInCitiesAr(dataItemPrep[dataItemPrepFields[j]], searchAr[i]) ) {
                        if ( i !== (len - 1) ) continue m;
                        else return true;
                    }
                    else if ( dataItemPrep[dataItemPrepFields[j]].toLowerCase().indexOf( searchAr[i].toLowerCase() ) !== -1 ) {
                        if ( i !== (len - 1) ) continue m;
                        else return true;
                    }

                    if ( j === (l - 1) ) {
                        return false;
                    }

                }
            }
        },

        passThroughShortcutsFilter: function(dataItem) {
            var idFilter = this.filters['shortcuts'];
            if ( idFilter.length === 0 ) return true;
            for ( var i = 0, len = idFilter.length; i < len; i++ ) {
                if ( dataItem['id'] === idFilter[i] ) return true;
                if ( i === len - 1 ) return false;
            }
        },

        prepareDataItemForSearch: function(dataItem) {
            dataItem['cardTypeSearch'] = (dataItem['cardType'] === 'O')? 'Основная': 'Дополнительная';
            dataItem['groupSearch'] = this.parent.groupMap[dataItem['group']];
            dataItem['cardFullSumSearch'] = dataItem['cardFullSum'].replace(/\s+/g, '');
            dataItem['frnSumSearch'] = dataItem['frnSum'].replace(/\s+/g, '');
            dataItem['frnCurSearch'] = app.ext.tools.cur[dataItem['frnCur'].toLowerCase()] || '';

            return dataItem;
        },

        prepareDataItemFieldsArray: function(dataItem) {
            var ar = [];
            for ( var key in dataItem ) {
                if ( dataItem.hasOwnProperty(key) ) {
                    if ( key === 'id' ) continue;
                    ar.push(key);
                }
            }
            return ar;
        },

        tryToFindStrInCountriesAr: function(country, searchStr) {
            if ( country.toLowerCase().indexOf( searchStr.toLowerCase() ) !== -1 ) return true;

            var countryAr = app.countries[country.toUpperCase()];
            if ( !countryAr ) return false;

            for ( var i = 0, len = countryAr.length; i < len; i++ ) {
                if ( countryAr[i].toLowerCase().indexOf( searchStr.toLowerCase() ) !== -1 ) {
                    return true;
                }
                if ( i === len - 1 ) return false;
            }
        },

        tryToFindStrInCitiesAr: function(city, searchStr) {
            if ( city.toLowerCase().indexOf( searchStr.toLowerCase() ) !== -1 ) return true;

            var ar = this.findCityAr(city);
            if ( !ar ) return false;

            for ( var i = 0, len = ar.length; i < len; i++ ) {
                if ( ar[i].toLowerCase().indexOf( searchStr.toLowerCase() ) !== -1 ) {
                    return true;
                }
                if ( i === len - 1 ) return false;
            }
        },

        findCityAr: function(city) {
            var citiesAr = app.cities;
            for ( var i = 0, len = citiesAr.length; i < len; i++ ) {
                for ( var j = 0, l = citiesAr[i].length; j < l; j++ ) {
                    if ( citiesAr[i][j].toLowerCase() === city.toLowerCase() ) {
                        return citiesAr[i];
                    }
                }
                if ( i === len - 1 ) return false;
            }
        },

        passThroughCardsFilter: function(dataItem) {
            var cards = this.filters.cards;
            var cardsLength = cards.length;

            if ( cardsLength === 0 ) return true;

            for ( var i = 0, len = cards.length; i < len; i++ ) {
                if ( dataItem['cardName'] === cards[i]['cardName'] &&
                dataItem['cardNum'].slice(15) === cards[i]['cardNum']) {
                    return false;
                }

                if ( i === len - 1 ) return true;
            }
        },

        drawHistorySecItem: function(el) {
            var dataItem = this.getDataItemById(el.id);

            var countryAr = app.countries[dataItem['country'].toUpperCase()];
            if ( countryAr ) dataItem['country'] = countryAr[0];

            var cityAr = this.findCityAr(dataItem['city']);
            if ( cityAr ) dataItem['city'] = cityAr[0];

            dataItem = this.prepareDataItem(dataItem);

            var secItem = document.createElement('div');
            secItem.className = 'trs_it-sec';
            secItem.innerHTML = app.ext.tmp(document.getElementById('HistoryItemSecondary').innerHTML)(dataItem);

            el.appendChild(secItem);
        },

        prepareDataItem: function(dataItem) {
            dataItem['cardType'] = ( dataItem['cardType'] === 'O' )? (this.en? 'primary' : 'основная'):
                (this.en? 'additional' : 'дополнительная');
            dataItem['cardNum'] = dataItem['cardNum'].slice(12).replace(/X/g, '&bull;');

            return dataItem;
        },

        changeCurrencies: function() {
            var curFields = this.el.querySelectorAll('.trs_it-cur');
            app.ext.tools.changeCurrencies(curFields);
        },

        bindEvents: function() {
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickHistoryItem));
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickCategoryName));

            app.ext.pubsub.addListener('categories:changed', app.ext.tools.bind(this, this.onCategoriesChange));
            app.ext.pubsub.addListener('search:changed', app.ext.tools.bind(this, this.onSearchChange));
            app.ext.pubsub.addListener('cardsFilter:changed', app.ext.tools.bind(this, this.onCardsFilterChange));
            app.ext.pubsub.addListener('period:changed', app.ext.tools.bind(this, this.onPeriodChange));
            app.ext.pubsub.addListener('shortcuts:changed', app.ext.tools.bind(this, this.onShortcutsChange));
        },

        onclickHistoryItem: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;
            var closest = app.ext.tools.closest(target, 'trs_it-main');

            if ( target.classList.contains('trs_it-main') || closest !== null ) {
                if ( closest ) target = closest;

                var trs_it = target.parentNode;
                var secItem;
                secItem = target.parentNode.querySelector('.trs_it-sec');

                if ( trs_it.classList.contains('-active') ) {
                    trs_it.classList.remove('-active');
                    secItem.style.display = 'none';
                } else {
                    trs_it.classList.add('-active');
                    if ( !secItem ) {
                        this.drawHistorySecItem(target.parentNode);
                        secItem = target.parentNode.querySelector('.trs_it-sec');
                        secItem.style.display = 'block';
                    } else {
                        secItem.style.display = 'block';
                    }
                }
            }
        },

        onclickCategoryName: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;

            if ( target.classList.contains('trs_it-cat-name') ) {
                if ( (app.ext['browser-type'].ie8 && app.ext.tools.closest(target, 'trs_it').classList.contains('-active')) ||
                    (!app.ext['browser-type'].ie8 && !app.ext.tools.closest(target, 'trs_it').classList.contains('-active')) ) {

                    app.ext.pubsub.fireEvent('category:selected', {category: target.innerHTML});
                }
            }
        },

        onCategoriesChange: function(o) {
            this.filters['categories'] = o.categories;
            this.drawHistory(this.data);
        },

        onSearchChange: function(o) {
            this.filters['search'] = o.text;
            this.drawHistory(this.data);
        },

        onCardsFilterChange: function(o) {
            this.filters['cards'] = o.cards;
            this.drawHistory(this.data);
        },

        onPeriodChange: function(o) {
            this.filters['period'] = o.period;
            this.drawHistory(this.data);
        },

        onShortcutsChange: function(o) {
            this.filters['shortcuts'] = o.filter;
            this.drawHistory(this.data);
        }
    };

    return {
        init: function() {
            var trs = document.querySelector('.b-trs');
            if ( trs !== null ) {
                app.module.trs = new Trs({el: trs, parent: app.module.history});
            }
        }
    }
});