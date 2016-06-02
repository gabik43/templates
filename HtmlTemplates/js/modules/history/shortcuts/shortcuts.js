app.register('module', 'shortcuts', function() {
    function Shortcuts(params) {
        this.el = params.el;
        this.parent = params.parent;

        this.en = app.en;

        this.maxFrnCountries = 5;

        this.activeShortcuts = [];

        this.initialize();
    }

    Shortcuts.prototype = {
        constructor: Shortcuts,

        initialize: function() {
            this.shortcutsList = this.defaultShortcutsList = this.getShortcutsList(this.parent.jsonData);
            this.drawShortcuts(this.shortcutsList);

            this.bindEvents();
        },

        // GET SHORTCUTS LIST

        getShortcutsList: function(data) {
            var list = [];

            var frnCurItemsAr = this.checkForCurrencyShortcutAr(data);
            if ( frnCurItemsAr.length !== 0 ) {
                list.push({
                    name: (app.cur.indexOf('ru') !== -1)? (this.en? 'In foreign currency': 'В иностранной валюте'):
                        (this.en? 'Not in the account currency': 'Не в валюте счета'),
                    value: frnCurItemsAr
                });
            }

            if ( this.parent.jsonData >= 30 ) {
                var bigSumItemsAr = this.checkForBigSumShortcutAr(data);
                if ( bigSumItemsAr.length !== 0 ) {
                    list.push({
                        name: (this.en? 'Large transactions': 'Крупные операции'),
                        value: bigSumItemsAr
                    });
                }
            }

            var countriesAr = this.getFrnCountries(data);
            for ( var i = 0, len = countriesAr.length; i < len; i++ ) {
                list.push({name: countriesAr[i]['name'], value: countriesAr[i]['value']});
            }

            return list;
        },

        checkForCurrencyShortcutAr: function(data) {
            var ar = [];
            for ( var i = 0, len = data.length; i < len; i++ ) {
                if ( data[i]['frnCur'] !== '' ) {
                    ar.push(data[i]['id']);
                }
            }
            return ar;
        },

        checkForBigSumShortcutAr: function(data) {
            var maxTrSum = this.getMaxTrSum(this.parent.jsonData);
            return this.getBigSumsTrsId(maxTrSum, data);
        },

        getMaxTrSum: function(data) {
            var sumAr = [];
            for ( var i = 0, len = data.length; i < len; i++ ) {
                sumAr.push( app.ext.tools.strToNum(data[i]['cardSum']) );
            }
            sumAr.sort(function(a, b){ return b - a; });
            return sumAr[0];
        },

        getBigSumsTrsId: function(maxSum, data) {
            var ar = [];
            for ( var i = 0, len = data.length; i < len; i++ ) {
                var dataSum = app.ext.tools.strToNum(data[i]['cardSum']);
                if ( dataSum >= maxSum * 0.9 ) {
                    ar.push( data[i]['id'] );
                }
            }
            return ar;
        },

        getFrnCountries: function(data) {
            var o = {},
                ar = [];
            for ( var i = 0, len = data.length; i < len; i++ ) {
                if ( data[i]['country'].toLowerCase() !== 'rus' ) {
                    if (o[data[i]['country']] ) {
                        o[data[i]['country']].push(data[i]['id']);
                    } else {
                        o[data[i]['country']] = [];
                        o[data[i]['country']].push(data[i]['id']);
                    }
                }
            }
            for ( var k in o ) {
                if (o.hasOwnProperty(k) ) {
                    var name = ( app.countries[k] )? app.countries[k][0] : k;
                    ar.push({name: name, value: o[k]});
                }
            }
            if ( ar.length > this.maxFrnCountries ) {
                var concAr = [];
                for ( var j = 0, l = ar.length; j < l; j++ ) {
                    concAr = concAr.concat(ar[j]['value']);
                }
                return [{name: (this.en? 'Abroad': 'Зарубежом'), value: concAr}];
            } else {
                return ar;
            }
        },

        // DRAW

        drawShortcuts: function(data) {
            this.el.innerHTML = '';

            if ( data.length === 0 ) return false;

            var title = document.createElement('div');
            title.className = 'shortcuts_title';
            title.innerHTML = (this.en? 'For example' : 'Например:');

            var list = document.createElement('ul');
            list.className = 'shortcuts_ul';
            var items = '';
            for ( var i = 0, len = data.length; i < len; i++ ) {
                items += app.ext.tmp(document.getElementById('ShortcutsItem').innerHTML)(data[i]);
            }
            list.innerHTML = items;

            this.el.appendChild(title);
            this.el.appendChild(list);
        },

        // FILTER

        setShortcutsFilter: function() {
            if ( this.activeShortcuts.length === 0 ) return [];

            var ar = [],
                filterAr = [];

            for ( var i = 0, len = this.activeShortcuts.length; i < len; i++ ) {
                for ( var j = 0, l = this.defaultShortcutsList.length; j < l; j++ ) {
                    if ( this.defaultShortcutsList[j]['name'] === this.activeShortcuts[i] ) {
                        ar = ar.concat(this.defaultShortcutsList[j]['value']);
                    }
                }
            }

            var o = {};

            for ( var n = 0, length = ar.length; n < length; n++ ) {
                if ( o[ar[n]] ) o[ar[n]]++;
                else o[ar[n]] = 1;
            }

            for ( var key in o ) {
                if ( o.hasOwnProperty(key) ) {
                    if ( o[key] === this.activeShortcuts.length ) filterAr.push(key);
                }
            }

            return filterAr;
        },

        removeFromActiveShortcutsList: function(names) {
            var ar = [];
            m:for ( var i = 0, len = this.activeShortcuts.length; i < len; i++ ) {
                for ( var j = 0, l = names.length; j < l; j++ ) {
                    if ( this.activeShortcuts[i] === names[j] ) continue m;
                    if ( j === l - 1 ) ar.push(this.activeShortcuts[i]);
                }
            }
            return ar;
        },

        // NOTIFY ABOUT CHANGES

        notifyAboutChanges: function() {
            var filter = this.setShortcutsFilter();
            app.ext.pubsub.fireEvent('shortcuts:changed', {filter: filter});
        },

        // EVENTS

        bindEvents: function() {
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickShortcut));

            app.ext.pubsub.addListener('shortcuts:remove', app.ext.tools.bind(this, this.onRemoveShortcuts));
            app.ext.pubsub.addListener('shortcuts:redraw', app.ext.tools.bind(this, this.onRedrawShortcuts));
        },

        onclickShortcut: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;

            if ( target.classList.contains('shortcuts_link') ) {
                event.preventDefault ? event.preventDefault() : (event.returnValue=false);

                var shortcutName = app.ext.tools.trim(target.innerHTML);
                this.activeShortcuts.push(shortcutName);
                app.ext.pubsub.fireEvent('search:add-shortcut', {name: shortcutName});

                this.notifyAboutChanges();
            }
        },

        onRemoveShortcuts: function(o) {
            var names = o.shortcutsNames;
            if ( names.length !== 0 ) {

                this.activeShortcuts = this.removeFromActiveShortcutsList(names);
            }
            this.notifyAboutChanges();
        },

        onRedrawShortcuts: function(o) {
            var data = o.data;
            var redrawList;

            this.shortcutsList = this.getShortcutsList(data);
            if ( this.activeShortcuts.length !== 0 ) redrawList = this.sliceListIfActiveShortcutsExist(this.shortcutsList);
            else redrawList = this.shortcutsList;

            this.drawShortcuts(redrawList);
        },

        sliceListIfActiveShortcutsExist: function(list) {
            var ar = [];
            a:for ( var i = 0, len = list.length; i < len; i++ ) {
                for ( var j = 0, l = this.activeShortcuts.length; j < l; j++ ) {
                    if ( list[i]['name'] === this.activeShortcuts[j] ) continue a;
                    if ( j == l - 1 ) ar.push(list[i]);
                }
            }
            return ar;
        }
    };

    return {
        init: function() {
            var shortcuts = document.querySelector('.b-shortcuts');
            if ( shortcuts !== null ) {
                app.module.trs = new Shortcuts({el: shortcuts, parent: app.module.history});
            }
        }
    }
});