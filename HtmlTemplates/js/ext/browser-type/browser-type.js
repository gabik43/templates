app.register('ext', 'browser-type', function() {
    return {
        ie8: ( document.all && document.querySelector && !document.addEventListener )?  true : false,
        ltie9: ( document.all && !window.atob )?  true : false,
        ltie10: ( document.all )?  true : false,
        ie11: window.navigator.appVersion.indexOf('.NET') !== -1,
        webkit: window.navigator.appVersion.toLocaleLowerCase().indexOf('webkit') !== -1
    }
});