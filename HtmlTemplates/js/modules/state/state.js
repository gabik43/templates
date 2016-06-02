app.register('module', 'state', function() {
    function State(params) {
        this.el = params.el;
        this.overdue = document.getElementById('OverduePayment');
        this.dropDown = this.el.querySelector('.state_details-add');
        this.dropDownInner = this.el.querySelector('.state_details-add-inner');

        this.en = app.en;

        this.active = false;

        this.initialize();
    }

    State.prototype = {
        constructor: State,

        initialize: function() {
            this.handleOverdue();
            this.handleStateDates();
            this.bindEvents();
        },

        handleStateDates: function() {
            var stateDates = this.el.querySelectorAll('.js-date');

            for ( var i = 0, len = stateDates.length; i < len; i++ ) {
                var stateDateEl = stateDates[i],
                    stateDateValue = app.ext.tools.trim(stateDateEl.innerHTML);

                stateDateEl.innerHTML = (this.en)? app.ext.tools.dateStrToStrWithFullMonth(stateDateValue, 'en') :
                    app.ext.tools.dateStrToStrWithFullMonth(stateDateValue, 'ru');
            }
        },

        handleOverdue: function() {
            if ( !this.overdue ) return false;
            if (app.ext.tools.strToNum(this.overdue.innerHTML)) {
                this.active = true;
                this.overdue.style.color = '#b22200';

                if ( !app.ext['browser-type'].ie8 ) {
                    this.dropDown.style.height = this.dropDown.offsetHeight + 'px';
                    this.dropDownInner.style.top = 0;
                }
            } else {
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
            if (!app.ext['browser-type'].ie8) {
                app.ext.tools.addListener(window, 'resize', app.ext.tools.bind(this, this.onresizeWindow));
            }
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

            var closest = app.ext.tools.closest(target, '_trigger');

            if ( target.classList.contains('_trigger') || closest !== null ) {
                if ( !app.ext['browser-type'].ie8 ) var height = this.dropDownInner.offsetHeight + 'px';
                if ( this.active ) {
                    if ( !app.ext['browser-type'].ie8 ) {
                        this.dropDown.style.height = height;
                        this.dropDownInner.style.top = '-' + this.dropDown.offsetHeight + 'px';
                        this.dropDown.style.height = 0;
                    } else {
                        this.dropDown.style.height = 0;
                    }

                    this.active = false;
                } else {
                    if ( !app.ext['browser-type'].ie8 ) {
                        this.dropDown.style.height = height;
                        this.dropDownInner.style.top = 0;
                    } else {
                        this.dropDown.style.height = 'auto';
                    }

                    this.active = true;
                }
            }
        }
    };

    return {
        init: function() {
            var state = document.querySelector('.b-state');
            if ( state !== null ) {
                new State({el: state});
            }
        }
    }
});