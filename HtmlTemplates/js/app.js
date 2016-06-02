var app = {
    el: document.getElementsByTagName('body')[0],
    popupSurround: document.body.querySelector('.body_popup-surround'),
    popup: document.body.querySelector('.body_popup'),

    module: {},
    ext: {},
    ui: {},

    register: function(type, name, func) {
        this[type][name] = func();
    },

    start: function(option) {
        var key;
        for (key in option) {
            if (option.hasOwnProperty(key)) {
                if ( this[key][option[key]].init !== undefined ) {
                    this[key][option[key]].init();
                }
            }
        }
    },

    bindEvents: function() {
        app.ext.pubsub.addListener('popup-surround:show', app.ext.tools.bind(this, this.showPopupSurround));
        app.ext.pubsub.addListener('popup-surround:hide', app.ext.tools.bind(this, this.hidePopupSurround));
    },

    showPopupSurround: function() {
        this.popupSurround.style.display = 'block';
        this.popup.style.display = 'block';
        var self = this;
        setTimeout(function() {
            self.popupSurround.style.opacity = .7;
            self.popup.style.opacity = 1;
        }, 50);
        this.el.style.overflow = 'hidden';
        document.documentElement.style.paddingRight = app.ext.tools.scrollBarWidth +  'px';
    },

    hidePopupSurround: function() {
        this.popupSurround.style.opacity = 0;
        this.popup.style.opacity = 0;
        var self = this;
        setTimeout(function() {
            self.popupSurround.style.display = '';
            self.popup.style.display = '';
            self.el.style.overflow = '';
            document.documentElement.style.paddingRight = 0;
        }, 500);
    }
};