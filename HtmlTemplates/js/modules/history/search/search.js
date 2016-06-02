app.register('module', 'search', function() {
    function Search(params) {
        this.el = params.el;
        this.parent = params.parent;
        this.loupeIcon = this.el.querySelector('.search_loupe');
        this.cancelIcon = this.el.querySelector('.search_cancel');

        this.tokenBox = this.el.querySelector('.search_token-box');
        this.inputBox = this.el.querySelector('.search_input-box');
        this.inputBoxLPadding = parseInt(app.ext.tools.getStyle(this.inputBox).paddingLeft);
        this.inputBoxRPadding = parseInt(app.ext.tools.getStyle(this.inputBox).paddingRight);
        this.inputBoxPadding = this.inputBoxLPadding + this.inputBoxRPadding;

        this.input = this.el.querySelector('.search_input');
        this.label = this.el.querySelector('.search_label');
        this.inputSizer = this.el.querySelector('.search_input-sizer');

        this.delimiter = ',';

        this.minInputBoxWidth = 100;
        this.inputSymbolFund = 20;

        this.initialize();
    }

    Search.prototype = {
        constructor: Search,

        initialize: function() {
            this.bindEvents();
        },

        goToInput: function() {
            this.label.style.display = 'none';
            this.input.focus();
        },

        setNewTokenIfInputValueExists: function() {
            var inputValue = this.input.value;
            if ( inputValue.length > 0 ) {
                var token = this.createToken(inputValue);
                this.addToken(token);
                this.showTokenBoxIfHidden();
                this.clearInputValue();
                this.setInputBoxMinWidth();
                this.showSearchCancelIcon();
                this.notifyAboutChanges( this.getTokensTexts() );
            } else {
                this.showLabel();
            }
        },

        addToken: function(token) {
            var firstToken = this.tokenBox.querySelector('.search_token');
            if ( firstToken !== null ) {
                this.tokenBox.insertBefore(token, firstToken);
            } else {
                this.tokenBox.appendChild(token);
            }
        },

        createToken: function(text) {
            var token = document.createElement('a');
            token.href = '#';
            token.className = 'search_token';

            var tokenText = document.createElement('span');
            tokenText.className = 'search_token-text';
            tokenText.innerHTML = app.ext.tools.trim(text);

            var tokenIcon = document.createElement('span');
            tokenIcon.className = 'search_token-icon';

            token.appendChild(tokenText);
            token.appendChild(tokenIcon);

            return token;
        },

        removeTokens: function(tokensAr) {
            var shortcutsNames = [];

            for ( var i = 0, len = tokensAr.length; i < len; i++ ) {
                if ( tokensAr[i].classList.contains('_shortcut') ) {
                    shortcutsNames.push(app.ext.tools.trim(tokensAr[i].querySelector('.search_token-text').innerHTML));
                }
                tokensAr[i].parentNode.removeChild(tokensAr[i]);
            }

            this.notifyAboutChanges( this.getTokensTexts() );

            app.ext.pubsub.fireEvent('shortcuts:remove', {shortcutsNames: shortcutsNames});

            this.hideSearchCancellationIfNoTokens();
        },

        getTokensTexts: function() {
            var tokensTextEls = this.tokenBox.querySelectorAll('.search_token .search_token-text');
            if ( tokensTextEls.length ) {
                var text = '';
                for ( var i = 0, len = tokensTextEls.length; i < len; i++ ) {
                    if ( tokensTextEls[i].parentNode.classList.contains('_shortcut') ) continue;
                    text += tokensTextEls[i].innerHTML + this.delimiter + ' ';
                }
                return text;
            }
            return '';
        },

        getActiveTokens: function() {
            return this.el.querySelectorAll('.search_token.-active');
        },

        showTokenBoxIfHidden: function() {
            if ( this.tokenBox.style.display !== 'block' ) {
                this.tokenBox.style.display = 'block';
                this.setInputBoxMinWidth();
            }
        },

        hideTokenBoxIfEmpty: function() {
            if ( this.tokenBox.querySelector('.search_token') === null ) {
                this.tokenBox.style.display = '';
                this.inputBox.style.width = '100%';
            }
        },

        showLabel: function() {
            this.label.style.display = 'block';
        },

        clearInputValue: function() {
            this.input.value = '';
        },

        setInputBoxMinWidth: function() {
            this.inputBox.style.width = this.minInputBoxWidth + 'px';
            this.tokenBox.style.marginLeft = this.minInputBoxWidth + 'px';
        },

        showSearchCancelIcon: function() {
            if ( this.cancelIcon.style.display !== 'block' ) {
                this.cancelIcon.style.display = 'block';
            }
        },

        hideSearchCancellationIfNoTokens: function() {
            if ( this.el.querySelectorAll('.search_token').length == 0 ) {
                this.cancelIcon.style.display = 'none';
            }
        },

        handleInputWidth: function() {
            this.inputSizer.innerHTML = this.input.value;
            var inputSizerWidth = this.inputSizer.clientWidth + this.inputSymbolFund;

            if ( this.minInputBoxWidth >= inputSizerWidth + this.inputBoxPadding ) {
                this.inputBox.style.width = this.minInputBoxWidth + 'px';
                this.tokenBox.style.marginLeft = this.minInputBoxWidth + 'px';
            } else {
                var newInputBoxWidth = inputSizerWidth + this.inputBoxPadding;
                this.inputBox.style.width = newInputBoxWidth + 'px';
                this.tokenBox.style.marginLeft = newInputBoxWidth + 'px';
            }
        },

        notifyAboutChanges: function(text) {
            app.ext.pubsub.fireEvent('search:changed', {text: text});
        },

        bindEvents: function() {
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickLabel));
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickSearchIcon));
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickTokenBox));
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickToken));
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickTokenCross));
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.onclickSearchCancel));
            app.ext.tools.addListener(this.el, 'keydown', app.ext.tools.bind(this, this.onkeydownInput));
            app.ext.tools.addListener(this.el, 'keypress', app.ext.tools.bind(this, this.onkeypressInput));
            app.ext.tools.addListener(this.el, 'keyup', app.ext.tools.bind(this, this.onkeyupInput));
            app.ext.tools.addListener(app.el, 'keydown', app.ext.tools.bind(this, this.onkeydownApp));
            app.ext.tools.addListener(app.el, 'keyup', app.ext.tools.bind(this, this.onkeyupApp));
            app.ext.tools.delegateFocus(this.el, app.ext.tools.bind(this, this.onfocusInput));
            app.ext.tools.delegateBlur(this.el, app.ext.tools.bind(this, this.onblurInput));

            app.ext.pubsub.addListener('search:add-shortcut', app.ext.tools.bind(this, this.addShortcut));
        },

        onclickLabel: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;
            var closest = app.ext.tools.closest(target, 'search_label');

            if ( target.classList.contains('search_label') || closest !== null ) {
                this.goToInput();
            }
        },

        onclickSearchIcon: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;

            if ( target.classList.contains('search_icon') ) {
                this.goToInput();
            }
        },

        onfocusInput: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;

            if ( target.classList.contains('search_input') ) {
                this.loupeIcon.classList.add('-active');
            }
        },

        onblurInput: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;

            if ( target.classList.contains('search_input') ) {
                this.setNewTokenIfInputValueExists();
                this.loupeIcon.classList.remove('-active');
            }
        },

        onclickTokenBox: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;
            var closest = app.ext.tools.closest(target, 'search_token-box');

            if ( target.classList.contains('search_token-box') || closest !== null ) {
                if ( app.ext.tools.closest(target, 'search_token') ) return false;
                this.goToInput();
            }
        },

        onclickToken: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;
            var closest = app.ext.tools.closest(target, 'search_token');

            if ( target.classList.contains('search_token') || closest !== null ) {
                event.preventDefault ? event.preventDefault() : (event.returnValue=false);
                if ( closest ) target = closest;
                target.classList.toggle('-active');
            }
        },

        onclickTokenCross: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;

            if ( target.classList.contains('search_token-icon') ) {
                this.removeTokens([app.ext.tools.closest(target, 'search_token')]);
                this.hideTokenBoxIfEmpty();
            }
        },

        onclickSearchCancel: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;

            if ( target.classList.contains('search_cancel') ) {
                var tokens = this.el.querySelectorAll('.search_token');
                this.removeTokens(tokens);
                this.hideTokenBoxIfEmpty();
                this.activeTokensExists = false;
            }
        },

        onkeydownInput: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;

            if ( target.classList.contains('search_input') ) {
                this.handleInputWidth();
            }
        },

        onkeypressInput: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;

            if ( target.classList.contains('search_input') ) {

            }
        },

        onkeyupInput: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;

            if ( target.classList.contains('search_input') ) {
                if ( event.keyCode == 32 ) {
                    this.input.value = this.input.value.replace(/^\s+/, '');
                }
                this.handleInputWidth();
                if ( event.keyCode == 13 ) {
                    this.setNewTokenIfInputValueExists();
                }
            }
        },

        onkeydownApp: function(e) {
            var event = e || window.event;
            if ( event.keyCode == 8 || event.keyCode == 46 ) {
                this.activeTokens = this.getActiveTokens();
                if ( this.activeTokens.length > 0 ) {
                    event.preventDefault ? event.preventDefault() : (event.returnValue=false);
                    this.activeTokensExists = true;
                }
            }
        },

        onkeyupApp: function(e) {
            var event = e || window.event;
            if ( event.keyCode == 8 || event.keyCode == 46 ) {
                if ( this.activeTokensExists ) {
                    this.removeTokens(this.activeTokens);
                    this.hideTokenBoxIfEmpty();
                    this.activeTokensExists = false;
                }
            }
        },

        addShortcut: function(o) {
            var token = this.createToken(o.name);
            token.classList.add('_shortcut');
            this.addToken(token);
            this.showTokenBoxIfHidden();
            this.clearInputValue();
            this.setInputBoxMinWidth();
            this.showSearchCancelIcon();
        }
    };

    return {
        init: function() {
            var search = document.querySelector('.b-search');
            if ( search !== null ) {
                app.module.search = new Search({el: search, parent: app.module.history});
            }
        }
    }
});