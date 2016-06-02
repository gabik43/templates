app.register('module', 'title', function() {
    function Title(params) {
        this.el = params.el;

        if ( !app.ext['browser-type'].ie8 ) {
            var titleTextEl = app.el.querySelector('.js-title');
            if ( titleTextEl ) {
                var titleText = titleTextEl.innerHTML;
                titleText = titleText.replace(/XXXXXXXXXX(XX)(1234)/i, '$1' + ' ' + '$2').replace(/X/gi, '&bull;');
                this.el.innerHTML =  titleText;
            }
        }
    }

    return {
        init: function() {
            var title = document.getElementsByTagName('title')[0];
            if ( title !== null ) {
                new Title({el: title});
            }
        }
    }
});