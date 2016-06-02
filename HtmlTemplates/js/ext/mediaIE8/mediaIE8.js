app.register('ext', 'mediaIE8', function() {
    return {
        handleScreenSize: function() {
            var scrollBarWidth = 17;

            if ( (document.documentElement.clientWidth + scrollBarWidth) <= 1359 &&
                (document.documentElement.clientWidth + scrollBarWidth) > 1300 ) {
                app.el.classList.add('js-lte-1359');
                app.el.classList.remove('js-lte-1300');
                app.el.classList.remove('js-lte-1260');
                app.el.classList.remove('js-lte-1220');
                app.el.classList.remove('js-lte-1170');
                app.el.classList.remove('js-lte-1070');
            }
            else if ( (document.documentElement.clientWidth + scrollBarWidth) <= 1300 &&
                (document.documentElement.clientWidth + scrollBarWidth) > 1260 ) {
                app.el.classList.add('js-lte-1359');
                app.el.classList.add('js-lte-1300');
                app.el.classList.remove('js-lte-1260');
                app.el.classList.remove('js-lte-1220');
                app.el.classList.remove('js-lte-1170');
                app.el.classList.remove('js-lte-1070');
            }
            else if ( (document.documentElement.clientWidth + scrollBarWidth) <= 1260 &&
                (document.documentElement.clientWidth + scrollBarWidth) > 1220 ) {
                app.el.classList.add('js-lte-1359');
                app.el.classList.add('js-lte-1300');
                app.el.classList.add('js-lte-1260');
                app.el.classList.remove('js-lte-1220');
                app.el.classList.remove('js-lte-1170');
                app.el.classList.remove('js-lte-1070');
            }
            else if ( (document.documentElement.clientWidth + scrollBarWidth) <= 1220 &&
                (document.documentElement.clientWidth + scrollBarWidth) > 1170 ) {
                app.el.classList.add('js-lte-1359');
                app.el.classList.add('js-lte-1300');
                app.el.classList.add('js-lte-1260');
                app.el.classList.add('js-lte-1220');
                app.el.classList.remove('js-lte-1170');
                app.el.classList.remove('js-lte-1070');
            }
            else if ( (document.documentElement.clientWidth + scrollBarWidth) <= 1170 &&
                (document.documentElement.clientWidth + scrollBarWidth) > 1070 ) {
                app.el.classList.add('js-lte-1359');
                app.el.classList.add('js-lte-1300');
                app.el.classList.add('js-lte-1260');
                app.el.classList.add('js-lte-1220');
                app.el.classList.add('js-lte-1170');
                app.el.classList.remove('js-lte-1070');
            }
            else if ( (document.documentElement.clientWidth + scrollBarWidth) <= 1070 ) {
                app.el.classList.add('js-lte-1359');
                app.el.classList.add('js-lte-1300');
                app.el.classList.add('js-lte-1260');
                app.el.classList.add('js-lte-1220');
                app.el.classList.add('js-lte-1170');
                app.el.classList.add('js-lte-1070');
            }
        },

        addResizeHandler: function() {
            app.ext.tools.addListener(window, 'resize', this.handleScreenSize);
        },

        init: function() {
            this.handleScreenSize();
            this.addResizeHandler();
        }
    }
});