app.en = app.el.classList.contains('_en');
app.periodStartDate = app.ext.tools.strToDate(document.getElementById('ReportPeriodStart').innerHTML, '.');
app.periodEndDate = app.ext.tools.strToDate(document.getElementById('ReportPeriodEnd').innerHTML, '.');
app.balanceStartNum = app.ext.tools.strToNum( app.el.querySelector('#BalanceStartNum').innerHTML );


app.start({ext: 'browser-type'});
app.start({ext: 'pubsub'});
app.start({ext: 'tools'});
app.start({ext: 'tmp'});

app.start({ui: 'datepicker'});

app.start({module: 'title'});
app.start({module: 'main'});
app.start({module: 'card-opers'});
app.start({module: 'state'});
app.start({module: 'balance'});
app.start({module: 'past-period'});
app.start({module: 'card'});
app.start({module: 'extra-cards'});
app.start({module: 'extra-card'});
app.start({module: 'card-info'});
app.start({module: 'history'});
app.start({module: 'categories'});
app.start({module: 'search'});
app.start({module: 'trs'});
app.start({module: 'cards-filter'});
app.start({module: 'period'});
app.start({module: 'shortcuts'});

if ( !app.ext['browser-type'].ie8 && window.d3 ) {
    app.start({module: 'chart'});
}

if ( app.ext['browser-type'].ie8 ) {
    app.start({ext: 'mediaIE8'});
}

app.bindEvents();