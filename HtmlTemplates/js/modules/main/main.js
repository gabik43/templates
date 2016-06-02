app.register('module', 'main', function() {
    function Main(params) {
        this.el = params.el;
        this.en = app.en;

        this.initialize();
    }

    Main.prototype = {
        constructor: Main,

        initialize: function() {
            this.handleReportFormedDate();
        },

        handleReportFormedDate: function() {
            var reportFormedDateEl = this.el.querySelector('.js-date'),
                reportFormedDateValue = app.ext.tools.trim(reportFormedDateEl.innerHTML);

            reportFormedDateEl.innerHTML = (this.en)? app.ext.tools.dateStrToStrWithFullMonth(reportFormedDateValue, 'en') :
                app.ext.tools.dateStrToStrWithFullMonth(reportFormedDateValue, 'ru');
        }
    };

    return {
        init: function() {
            var main = document.querySelector('.b-main');
            if ( main !== null ) {
                new Main({el: main});
            }
        }
    }
});