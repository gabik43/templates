app.register('ext', 'tools', function() {
    return {

        // LISTS

        monthWordHash: {
            '01': 'января',
            '02': 'февраля',
            '03': 'марта',
            '04': 'апреля',
            '05': 'мая',
            '06': 'июня',
            '07': 'июля',
            '08': 'августа',
            '09': 'сентября',
            '10': 'октября',
            '11': 'ноября',
            '12': 'декабря'
        },

        monthWordHash2: {
            '01': 'январь',
            '02': 'февраль',
            '03': 'март',
            '04': 'апрель',
            '05': 'май',
            '06': 'июнь',
            '07': 'июль',
            '08': 'август',
            '09': 'сентябрь',
            '10': 'октябрь',
            '11': 'ноябрь',
            '12': 'декабрь'
        },

        monthWordHash3: {
            '01': 'январе',
            '02': 'феврале',
            '03': 'марте',
            '04': 'апреле',
            '05': 'мае',
            '06': 'июне',
            '07': 'июле',
            '08': 'августе',
            '09': 'сентябре',
            '10': 'октябре',
            '11': 'ноябре',
            '12': 'декабре'
        },

        monthWordHashRev: {
            'января': '01',
            'февраля': '02',
            'марта': '03',
            'апреля': '04',
            'мая': '05',
            'июня': '06',
            'июля': '07',
            'августа': '08',
            'сентября': '09',
            'октября': '10',
            'ноября': '11',
            'декабря': '12'
        },

        monthWordHashRevEn: {
            'January': '01',
            'February': '02',
            'March': '03',
            'April': '04',
            'May': '05',
            'June': '06',
            'July': '07',
            'August': '08',
            'September': '09',
            'October': '10',
            'November': '11',
            'December': '12'
        },

        monthWordHashEn: {
            '01': 'January',
            '02': 'February',
            '03': 'March',
            '04': 'April',
            '05': 'May',
            '06': 'June',
            '07': 'July',
            '08': 'August',
            '09': 'September',
            '10': 'October',
            '11': 'November',
            '12': 'December'
        },

        cur: {
            usd: '$',
            gbp: '£',
            eur: '€',
            jpy: '¥',
            cny: '¥'
        },

        // CORE HELPERS

        bind: function (o, m) {
            return function () {
                return m.apply(o, [].slice.call(arguments));
            };
        },

        trim: function(str) {
            return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        },

        extendDeep: function(parent, child) {
            var i,
                toStr = Object.prototype.toString,
                astr = '[object Array]';

            child = child || {};

            for (i in parent) {
                if (parent.hasOwnProperty(i)) {
                    if (typeof parent[i] === 'object') {
                        child[i] = (toStr.call(parent[i]) === astr) ? [] : {};
                        this.extendDeep(parent[i], child[i]);
                    } else {
                        child[i] = parent[i];
                    }
                }
            }

            return child;
        },

        findAllEntries: function(str, substr) {
            var pos = -1,
                ar = [];

            while ( (pos = str.indexOf(substr, pos + 1)) !== -1 ) {
                ar.push(pos);
            }

            return ar;
        },

        round: function(num, precision) {
            return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
        },

        colorLum: function(hexColor, lum) {
            hexColor = String(hexColor).replace(/[^0-9a-f]/gi, '');
            if (hexColor.length < 6) {
                hexColor = hexColor[0]+hexColor[0]+hexColor[1]+hexColor[1]+hexColor[2]+hexColor[2];
            }
            lum = lum || 0;

            var rgb = "#", c, i;
            for (i = 0; i < 3; i++) {
                c = parseInt(hexColor.substr(i*2,2), 16);
                c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
                rgb += ("00"+c).substr(c.length);
            }

            return rgb;
        },

        // DOM HELPERS

        closest: function(el, closestClassSelector) {
            var target = el;

            while ( target.tagName.toLowerCase() !== 'body' ) {
                target = target.parentNode;
                if ( target.classList.contains(closestClassSelector) ) {
                    return target;
                }
            }

            return null;

        },

        addListener: function(elem, type, handler) {
            if ( document.addEventListener ) {
                elem.addEventListener(type, handler);
            } else {
                elem.attachEvent('on' + type, handler);
            }
        },

        removeListener: function(elem, type, handler) {
            if ( document.removeEventListener ) {
                elem.removeEventListener(type, handler);
            } else {
                elem.detachEvent('on' + type, handler);
            }
        },

        delegateFocus: function(el, onFocusFunc) {
            if (el.addEventListener) {
                el.addEventListener('focus', onFocusFunc, true);
            } else {
                el.attachEvent('onfocusin', onFocusFunc);
            }
        },

        delegateBlur: function(el, onBlurFunc) {
            if (el.addEventListener) {
                el.addEventListener('blur', onBlurFunc, true);
            } else {
                el.attachEvent('onfocusout', onBlurFunc);
            }
        },

        getStyle: function(elem) {
            return window.getComputedStyle ? getComputedStyle(elem, '') : elem.currentStyle;
        },

        moveCaretTo: function(el, pos) {
            if ( el.createTextRange ) {
                var r = el.createTextRange();
                r.collapse();
                r.moveStart("character", pos);
                r.select();
            }
            else el.setSelectionRange(pos, pos);
        },

        getChar: function(e) {
            return (e.which == null)? String.fromCharCode(e.keyCode) : String.fromCharCode(e.which);
        },

        scrollBarWidth: (function() {
            var div = document.createElement('div');
            div.style.cssText = 'width: 100px; height: 100px; overflow: auto; position: absolute; visibility: hidden;';
            div.innerHTML = ' Lorem ipsum dolor sit amet, consectetur adipisicing elit.' +
            'A alias animi, dolorem dolores iure modi molestias natus necessitatibus,' +
            'odit perspiciatis porro quaerat quo, quod quos tempore tenetur ut vero vitae.';
            document.body.appendChild(div);
            var scrollBarWidth = div.offsetWidth - div.clientWidth;
            div.parentNode.removeChild(div);
            return scrollBarWidth;
        })(),

        // OTHER HELPERS

        strToDate: function(str, splitter) {
            var ar = str.split(splitter);
            if ( ar[2].length === 2 ) ar[2] = '20' + ar[2];
            if ( ar[1].charAt(0) === '0' ) ar[1] = ar[1].slice(1);
            if ( ar[0].charAt(0) === '0' ) ar[0] = ar[0].slice(1);
            ar[2] = parseInt(ar[2], 10);
            ar[1] = parseInt(ar[1], 10) - 1;
            ar[0] = parseInt(ar[0], 10);

            return new Date(ar[2], ar[1], ar[0]);
        },

        dateToStr: function(date, splitter) {
            var year = date.getFullYear();
            var month = (date.getMonth() + 1) + '';
            if ( month.length === 1 ) month = '0' + month;
            var day = date.getDate() + '';
            if ( day.length === 1 ) day = '0' + day;

            return day + splitter + month + splitter + year;
        },

        strWithFullMonthToDateStr: function(str, lang) {
            if ( lang === 'en' ) str = str.replace(/,\s+/g, ' ');
            var ar = str.split(' ');
            if ( lang === 'ru' ) return ar[0] + '.' + this.monthWordHashRev[ar[1]] + '.' + ar[2];
            else if ( lang === 'en' ) return ar[1] + '.' + this.monthWordHashRevEn[ar[0]] + '.' + ar[2];
        },

        strWithFullMonthToDate: function(str, lang) {
            str = this.strWithFullMonthToDateStr(str, lang);
            return this.strToDate(str, '.');
        },

        dateStrToStrWithFullMonth: function(dateStr, lang) {
            var dateAr = dateStr.split('.');
            if ( lang === 'ru' ) return dateAr[0] + ' ' + this.monthWordHash[dateAr[1]] + ' ' + dateAr[2];
            else if ( lang === 'en' ) return this.monthWordHashEn[dateAr[1]] + ' ' +  dateAr[0] + ', ' + dateAr[2];
        },

        strToNum: function(str) {
            return  parseFloat(str.replace(/\s*/g, '').replace(/&nbsp;/g ,'').replace(',', '.'));
        },

        numToStr: function(digit) {
            digit = '' + digit;
            var devInd = digit.indexOf('.'),
                integer, fraction;

            if ( devInd !== -1 ) {
                integer = digit.slice(0, devInd);
                fraction = digit.slice(devInd + 1);
            } else {
                integer = digit.slice(0);
                fraction = '00';
            }

            if (fraction.length == 1) fraction = fraction + '0';

            var result = '',
                integerLength = integer.length;

            for (var i = integerLength - 1, counter = 0; i >= 0; i--) {
                result = integer.substr(i, 1) + result;
                counter++;
                if (counter == 3 && i) {
                    counter = 0;
                    result = ' ' + result;
                }
            }

            return result + ',' + fraction;
        },

        handleRuCase: function(intContainer, textContainer, nominative, genitive, plural, presenceIndicator) {
            if ( textContainer.innerHTML.indexOf(presenceIndicator) !== -1 ) {
                var l = intContainer.innerHTML.length,
                    v = intContainer.innerHTML;
                if ( l === 1 ) {
                    if ( v === '1' ) textContainer.innerHTML = nominative;
                    else if ( v === '2' || v === '3' || v === '4' ) textContainer.innerHTML = genitive;
                    else textContainer.innerHTML = plural;
                } else if ( l > 1 ) {
                    if ( v.charAt(l - 1) === '1' && v.charAt(l - 2) !== '1' ) textContainer.innerHTML = nominative;
                    else if ( (v.charAt(l - 1) === '2' || v.charAt(l - 1) === '3' || v.charAt(l - 1) === '4') &&
                        ( v.charAt(l - 2) !== '1' )) {
                        textContainer.innerHTML = genitive;
                    }
                    else textContainer.innerHTML = plural;
                }
            }
        },

        handleEnCase: function(intContainer, textContainer, one, plural, presenceIndicator) {
            if (textContainer.innerHTML.indexOf(presenceIndicator) !== -1) {
                var enVal = intContainer.innerHTML;
                if ( enVal == 1 ) textContainer.innerHTML = one;
                else textContainer.innerHTML = plural;
            }
        },

        changeCurrencies: function(curFields) {
            for (var i = 0, len = curFields.length; i < len; i++) {
                var curFieldVal = curFields[i].innerHTML.toLowerCase();

                if ( (curFieldVal === 'rub' || curFieldVal === 'rur') && !app.ext['browser-type'].ie8 ) {
                    curFields[i].innerHTML = '';
                    curFields[i].classList.add('_rub');
                }
                else if ( this.cur[curFieldVal] !== undefined ) {
                    curFields[i].innerHTML = this.cur[curFieldVal]
                }
            }
        }
    }
});