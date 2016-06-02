app.register('module', 'past-period', function() {
    function PastPeriod(params) {
        this.el = params.el;
        this.dropDown = this.el.querySelector('.past-period_content-wrapper');
        this.dropDownInner = this.el.querySelector('.past-period_content-inner');
        this.overduePayment = document.getElementById('StateOverduePayment');
        this.overdueTotal = document.getElementById('OverdueTotal');
        this.statusOk = this.el.querySelector('.past-period_status._ok');
        this.statusOverdue = this.el.querySelector('.past-period_status._overdue');

        this.active = false;

        this.initialize();
    }

    PastPeriod.prototype = {
        constructor: PastPeriod,

        initialize: function() {
            this.handleOverdue();
            this.bindEvents();
        },

        handleOverdue: function() {
            if (app.ext.tools.strToNum(this.overduePayment.innerHTML)) {
                this.overduePayment.style.color = '#b22200';
                this.overdueTotal.style.color = '#b22200';

                this.statusOk.style.display = 'none';
                this.statusOverdue.style.display = 'block';

                this.active = true;
                if ( !app.ext['browser-type'].ie8 ) {
                    this.dropDown.style.height = this.dropDown.offsetHeight + 'px';
                    this.dropDownInner.style.top = 0;
                }
            } else {
                this.statusOk.style.display = 'block';
                this.statusOverdue.style.display = 'none';

                if ( !app.ext['browser-type'].ie8 ) {
                    this.dropDownInner.style.top = '-' + this.dropDown.offsetHeight + 'px';
                    this.dropDown.style.height = 0 + 'px';
                } else {
                    this.dropDown.style.display = 'none';
                }
            }
        },


        bindEvents: function() {
            app.ext.tools.addListener(this.el, 'click', app.ext.tools.bind(this, this.toggleDropDown));
            if (!app.ie8) app.ext.tools.addListener(window, 'resize', app.ext.tools.bind(this, this.onresizeWindow));
        },

        onresizeWindow: function() {
            if ( this.dropDown.style.height != '0px' ) {
                this.dropDown.style.height = 'auto';
            } else {
                var height = this.dropDownInner.offsetHeight + 'px';
                this.dropDownInner.style.top = '-' + height;
            }
        },

        toggleDropDown: function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;

            var closest = app.ext.tools.closest(target, 'past-period_header-name');
            if ( target.classList.contains('past-period_header-name') || closest !== null ) {
                if ( !app.ext['browser-type'].ie8 ) var height = this.dropDownInner.offsetHeight + 'px';
                if ( this.active ) {
                    if ( !app.ext['browser-type'].ie8 ) {
                        this.dropDown.style.height = height;
                        this.dropDownInner.style.top = '-' + this.dropDown.offsetHeight + 'px';
                        this.dropDown.style.height = 0;
                    } else {
                        this.dropDown.style.display = 'none';
                    }

                    this.active = false;
                } else {
                    if ( !app.ext['browser-type'].ie8 ) {
                        this.dropDown.style.height = height;
                        this.dropDownInner.style.top = 0;
                    } else {
                        this.dropDown.style.display = 'block';
                    }

                    this.active = true;
                }
            }
        }
    };

    return {
        init: function() {
            var state = document.querySelector('.b-past-period');
            if ( state !== null ) {
                new PastPeriod({el: state});
            }
        }
    }
});