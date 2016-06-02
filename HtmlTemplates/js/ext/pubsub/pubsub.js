app.register('ext', 'pubsub', function() {
    function PubSub() {
        this.listeners = {};
    }

    PubSub.prototype = {
        constructor: PubSub,

        addListener: function(type, listenter) {
            if ( typeof this.listeners[type] === 'undefined' ) {
                this.listeners[type] = [];
            }
            this.listeners[type].push(listenter);
        },

        removeListener: function(type, listener) {
            var listeners = this.listeners[type];
            if ( typeof listeners === 'undefined' ) return false;
            for ( var i = 0, len = listeners.length; i < len; i++ ) {
                if ( listeners[i] === listener ) {
                    listeners.splice(i, 1);
                    break;
                }
            }
        },

        fireEvent: function(type, evtData) {
            if ( typeof type === 'undefined' ) return false;
            evtData = evtData || {};
            if ( typeof evtData.context === 'undefined' ) evtData.context = this;
            var listeners = this.listeners[type];
            if ( typeof listeners === 'undefined' ) return false;
            for ( var i = 0, len = listeners.length; i < len; i++ ) {
                listeners[i].apply(evtData.context, [].slice.call(arguments, 1));
            }
        }
    };

    return new PubSub();
});