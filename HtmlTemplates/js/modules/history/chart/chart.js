app.register('module', 'chart', function() {
    function Chart(params) {
        this.el = params.el;
        this.parent = params.parent;
        this.chartWrapper = this.el.querySelector('.chart_chart-wrapper');
        this.balanceStartNum = app.ext.tools.strToNum( app.el.querySelector('#BalanceStartNum').innerHTML );

        this.en = app.en;

        this.maxRefR = 6;
        this.refPadding = 10;
        this.maxExpBalH = 35;
        this.brushH = 24;
        this.chartH = this.maxRefR*2 + this.refPadding + this.maxExpBalH;
        this.svgH = this.chartH + this.brushH;
        this.leftIndent = 10;
        this.rightIndent = 10;

        this.brushExtent = [];

        this.enteredResizeEl = false;
        this.brushing = false;
        this.alertContentReversed = false;

        this.initialize();
    }

    Chart.prototype = {
        constructor: Chart,

        filters: {
            cards: []
        },

        initialize: function() {
            this.setPeriod();
            this.definePeriodLength();

            this.data = this.prepareData(this.parent.jsonData, false);
            this.balanceData = this.prepareData(this.parent.jsonData, true);

            if ( this.data.length < 2 ) {
                this.el.parentNode.removeChild(this.el);
                return false;
            }
            //this.data[2].balance = -100000.00;

            this.setD3Localization();
            this.addSvg();

            this.prepareChart(this.data);
            this.styleChart(this.data, this.xScale, this.yScalesObj);

            this.addBrush(this.xScale, this.timeAxis, this.chartDateMin, this.chartDateMax);
            this.incSvgIfMinusBalance(this.data, this.yScalesObj);

            this.bindEvents();
        },

        setD3Localization: function() {
            var ru_RU = {
                "decimal": ",",
                "thousands": "\xa0",
                "grouping": [3],
                "currency": ["", " руб."],
                "dateTime": "%A, %e %B %Y г. %X",
                "date": "%d.%m.%Y",
                "time": "%H:%M:%S",
                "periods": ["AM", "PM"],
                "days": ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
                "shortDays": ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
                "months": ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль",
                            "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
                "shortMonths": ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЙ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК"]
            };

            this.ru = d3.locale(ru_RU);
        },

        setPeriod: function() {
            this.dateMin = app.periodStartDate;
            this.dateMax = app.periodEndDate;
        },

        definePeriodLength: function() {
            var monthsQty = (this.dateMax.getTime() - this.dateMin.getTime()) / (1000*60*60*24) / 31;
            this.lessThanAMonth = ( monthsQty < 1 );
            this.moreThanAMonth = ( monthsQty >= 1 && monthsQty <= 12 );
            this.moreThanAYear = ( monthsQty > 12 );
        },

        // PREPARE DATA

        prepareData: function(data, balanceFlag) {
            var extData = app.ext.tools.extendDeep(data, []);

            if ( !balanceFlag ) this.parent.sortData(extData,'date', 'date', false);
            else this.parent.sortData(extData,'postDate', 'date', false);

            if ( !balanceFlag ) extData = this.excludeDeviationDates(extData); ////

            var ar = this.transformOriginalDataPerDay(extData, balanceFlag);
            ar = this.addBalanceToData(ar);
            ar = this.parseStrDate(ar);
            ar = this.addStartEndObjIfNeed(ar);

            return ar;
        },

        excludeDeviationDates: function(data) { ////
            var ar = [];
            for ( var i = 0, len = data.length; i < len; i++ ) {
                if ( data[i]['showDate'] ) continue;
                ar.push(data[i]);
            }
            return ar;
        },

        transformOriginalDataPerDay: function(extData, balanceFlag) {
            var ar = [];

            var o = {date: '', expense: 0, refill: 0, balance: 0};

            for ( var i = 0, len = extData.length; i < len; i++ ) {
                var date = (balanceFlag)? extData[i]['postDate'] : extData[i]['date'];
                var extDataItemDate;
                if ( this.moreThanAYear ) {
                    extDataItemDate = '01.' + date.slice(3);
                }
                else extDataItemDate = date;

                if ( i > 0 ) {
                    if ( extDataItemDate === o['date'] ) {
                        o = this.sumDataItemGroups(o, extData[i]);
                    } else {
                        ar.push(o);
                        o = {date: '', expense: 0, refill: 0, balance: 0};
                        o['date'] = extDataItemDate;
                        o = this.sumDataItemGroups(o, extData[i]);
                    }
                    if ( i === extData.length - 1 ) ar.push(o);
                } else {
                    o['date'] = extDataItemDate;
                    o = this.sumDataItemGroups(o, extData[i]);
                }
            }

            return ar;
        },

        sumDataItemGroups: function(o, dataItem) {
            var sum = app.ext.tools.strToNum(dataItem['cardSum']);

            if ( dataItem['group'] === 'refill' ) {
                o['refill'] = app.ext.tools.round((( o['refill']*100 + sum*100)/100), 2 );
            }
            if ( dataItem['group'] === 'cash' ) {
                o['expense'] = app.ext.tools.round((( o['expense']*100 + sum*100 )/100), 2);
            }
            if ( dataItem['group'] === 'cashless' ) {
                o['expense'] = app.ext.tools.round((( o['expense']*100 + sum*100 )/100), 2);
            }

            return o;
        },

        addBalanceToData: function(ar) {
            var startNum = this.balanceStartNum;

            for ( var i = 0, len = ar.length; i < len; i++ ) {
                if ( i === 0 ) {
                    ar[i]['balance'] = app.ext.tools.round((startNum*100 - ar[i]['expense']*100 +
                                                                                        ar[i]['refill']*100)/100, 2);
                } else {
                    ar[i]['balance'] = app.ext.tools.round((ar[i - 1]['balance']*100 - ar[i]['expense']*100 +
                                                                                        ar[i]['refill']*100)/100, 2);
                }
            }

            return ar;
        },

        parseStrDate: function(ar) {
            for ( var i = 0, len = ar.length; i < len; i++ ) {
                ar[i].date = app.ext.tools.strToDate(ar[i].date, '.');
            }
            return ar;
        },

        addStartEndObjIfNeed: function(ar) {
            if ( this.moreThanAYear ) {
                if ( ar[0]['date'].getFullYear() !== this.dateMin.getFullYear() ||
                    ar[0]['date'].getMonth() !== this.dateMin.getMonth() ) {
                    ar.unshift({balance: this.balanceStartNum, date: this.dateMin, expense: 0, refill: 0});
                    this.addStartEndObj = true;
                }
                if ( ar[ar.length-1]['date'].getFullYear() !== this.dateMin.getFullYear() ||
                    ar[ar.length-1]['date'].getMonth() !== this.dateMin.getMonth() ) {
                    ar.push({balance: ar[ar.length-1]['balance'], date: this.dateMax, expense: 0, refill: 0});
                    this.addStartEndObj = true;
                }
            } else {
                if (ar[0]['date'].getTime() !== this.dateMin.getTime()) {
                    ar.unshift({balance: this.balanceStartNum, date: this.dateMin, expense: 0, refill: 0});
                }
                if (ar[ar.length-1]['date'].getTime() !== this.dateMax.getTime()) {
                    ar.push({balance: ar[ar.length-1]['balance'], date: this.dateMax, expense: 0, refill: 0});
                }
            }

            return ar;
        },

        // FILTER

        prepareFilteredData: function(data) {
            var extData = app.ext.tools.extendDeep(data, []);

            for ( var i = 0, len = extData.length; i < len; i++ ) {
                extData[i] = this.passThroughCardsFilter(extData[i]);
            }

            var filteredData = this.prepareData(extData);
            this.data = this.prepareData(data);

            for ( var j = 0, l = this.data.length; j < l; j++ ) {
                this.data[j]['expense'] = filteredData[j]['expense'];
            }
        },

        passThroughCardsFilter: function(dataItem) {
            var cards = this.filters['cards'];
            if ( cards.length === 0 ) {
                return dataItem;
            }

            for ( var i = 0, len = cards.length; i < len; i++ ) {
                if ( dataItem['cardName'] === cards[i]['cardName'] && dataItem['cardNum'].slice(15) === cards[i]['cardNum']) {
                    if ( dataItem['group'] === 'cash' || dataItem['group'] === 'cashless' ) {
                        dataItem['cardSum'] = '0,00';
                    }
                    return dataItem;
                }

                if ( i === len - 1 ) {
                    return dataItem;
                }
            }
        },

        // ADDING CHART ELS

        addSvg: function() {
            d3.select('.chart_chart-wrapper').append('svg')
                .attr({
                    width: this.leftIndent + this.chartWrapper.clientWidth + this.rightIndent + 'px',
                    height: this.svgH + 'px',
                    'class': 'chart_svg'
                })
                .style({margin: '0 -10px'});

            this.D3svg = d3.select('.chart_svg');
        },

        prepareChart: function(data) {
            this.addSvgElsAndBindData(data);

            this.yScalesObj = this.setYScales(data);
            this.xScale = this.setXScale();
            this.addTimeAxis(this.xScale);
        },

        addSvgElsAndBindData: function(data) {
            this.addGradForBalanceLine(this.D3svg);
            this.addBalance(this.D3svg, this.balanceData);
            this.addExpense(this.D3svg, data);
            this.addRefill(this.D3svg, data);
        },

        addGradForBalanceLine: function(container) {
            container.append("linearGradient")
                .attr("id", "BalanceGrad")
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", 0).attr("y1", 0)
                .attr("x2", 0).attr("y2", '100%')
                .selectAll("stop")
                .data([
                    {offset: "0%", color: "#d8dadc"},
                    {offset: "60%", color: "#d8dadc"},
                    {offset: "60%", color: "#ddcc65"},
                    {offset: "70%", color: "#ddcc65"},
                    {offset: "100%", color: "red"}
                ])
                .enter().append("stop")
                .attr("offset", function(d) { return d.offset; })
                .attr("stop-color", function(d) { return d.color; });
        },

        addExpense: function(container, data) {
            container.selectAll('rect.expense').data(data).enter().append('rect').attr('class', 'expense');
            this.removeWithoutData(d3.selectAll('rect.expense')[0], 'expense');
        },

        addBalance: function(container, data) {
            if ( !this.addStartEndObj ) { this.addDataItemForBalanceLineEnd(data) }
            container.selectAll('rect.balance').data(data).enter().append('rect').attr('class', 'balance');
            this.removeWithoutData(d3.selectAll('rect.balance')[0], 'balance');
        },

        addDataItemForBalanceLineEnd: function(data) {
            var lastItem = {};
            lastItem.date = data[data.length - 1].date;
            lastItem.date = new Date((lastItem.date.getTime() + ((this.moreThanAYear)? 1000*60*60*24*30 : 1000*60*60*24) ) - 1);
            lastItem.expense = data[data.length - 1].expense;
            lastItem.refill = data[data.length - 1].refill;
            lastItem.balance = data[data.length - 1].balance;
            data.push(lastItem);
        },

        addRefill: function(container, data) {
            container.selectAll('circle.refill').data(data).enter().append('circle').attr('class', 'refill');
            this.removeWithoutData(d3.selectAll('circle.refill')[0], 'refill');

            container.append('path').attr({'class': 'balance-line'})
                .style({
                    fill: 'none',
                    stroke: '#d8dadc',
                    'stroke-width': '1px'
                });
        },

        removeWithoutData: function(ar, attr) {
            for ( var i = 0, len = ar.length; i < len; i++ ) {
                if ( ar[i].__data__[attr] === 0 ) ar[i].parentNode.removeChild(ar[i]);
            }
        },

        setYScales: function(data) {
            var yMaxExpense = d3.max(data, function(d) { return d['expense'] }),
                yMaxBalance = d3.max(this.balanceData, function(d) { return Math.abs(d['balance']) }),
                yMaxRefill = d3.max(data, function(d) { return d['refill'] }),
                expenseYScale = d3.scale.linear().domain([0, yMaxExpense]).range([2, this.maxExpBalH]),
                balanceYScale = d3.scale.linear().domain([0, yMaxBalance]).range([0, this.maxExpBalH]),
                refillYScale = d3.scale.linear().domain([0, yMaxRefill]).range([2, this.maxRefR]);

            return {
                expenseYScale: expenseYScale,
                balanceYScale: balanceYScale,
                refillYScale: refillYScale
            };
        },

        setXScale: function() {
            if ( this.moreThanAYear ) {
                this.chartDateMin = new Date(this.dateMin.getFullYear(), this.dateMin.getMonth(), 1);
                var maxDateEndMonth = new Date(this.dateMax.getFullYear(), this.dateMax.getMonth() + 1, 0);
                if ( this.addStartEndObj ) {
                    this.chartDateMax = this.dateMax;
                } else {
                    this.chartDateMax = new Date(this.dateMax.getTime() + (maxDateEndMonth.getTime() - this.dateMax.getTime()) - 1);
                }
            } else {
                this.chartDateMin = this.dateMin;
                this.chartDateMax = new Date(this.dateMax.getTime() + 1000*60*60*24 - 1);
            }

            return d3.time.scale()
                .domain([this.chartDateMin, this.chartDateMax])
                .range([0 + this.leftIndent, this.chartWrapper.clientWidth + this.leftIndent]);
        },

        addTimeAxis: function(xScale) {
            var formatEn, formatRu;
            if ( this.moreThanAMonth ) {
                formatEn = d3.time.format.multi([
                    ["%b", function(d) { return d.getMonth() != 0; }],
                    ["%b %Y", function() { return true; }]
                ]);
                formatRu = this.ru.timeFormat.multi([
                    ["%b", function(d) { return d.getMonth() != 0; }],
                    ["%b %Y", function() { return true; }]
                ]);
                this.timeAxis = d3.svg.axis().scale(xScale).orient('bottom')
                    .ticks(d3.time.months).tickFormat( (this.en)? formatEn : formatRu );
            }
            else if ( this.moreThanAYear ) {
                this.timeAxis = d3.svg.axis().scale(xScale).orient('bottom')
                    .ticks(d3.time.years).tickFormat(
                        (this.en)? d3.time.format('%Y') : this.ru.timeFormat('%Y')
                    );
            }
            else {
                formatEn = d3.time.format.multi([
                    ["%e", function(d) { return d.getDate() != 1; }],
                    ["%e %b", function() { return true; }]
                ]);
                formatRu = this.ru.timeFormat.multi([
                    ["%e", function(d) { return d.getDate() != 1; }],
                    ["%e %b", function() { return true; }]
                ]);
                this.timeAxis = d3.svg.axis().scale(xScale).orient('bottom')
                    .ticks(d3.time.days).tickFormat(
                        (this.en)? formatEn : formatRu
                );
            }

            this.D3svg.append('g').attr({transform: 'translate(0, ' + this.chartH + ')', 'class': 'x-axis'})
                .call(this.timeAxis);

            var D3xAxis = d3.select('.x-axis');
            D3xAxis.selectAll(".tick > line").style({stroke: '#a1a1a1'});
            D3xAxis.selectAll("text")
                .attr("y", 8).attr("x", 0).attr("dy", "1em")
                .style({"font-size": "10px", fill: '#a1a1a1'});

            if ( this.moreThanAMonth || this.moreThanAYear ) {
                var ticks = this.el.querySelectorAll('.tick');
                this.checkForCutTicksNames(ticks);
            }
        },

        checkForCutTicksNames: function(ticks) {
            if ( ticks[0].getBoundingClientRect().left <= this.el.getBoundingClientRect().left ) {
                ticks[0].querySelector('text').style.textAnchor = 'start';
                ticks[0].querySelector('text').setAttribute('x', '2');
            }
            if ( ticks[ticks.length - 1].getBoundingClientRect().right >= this.el.getBoundingClientRect().right ) {
                ticks[ticks.length - 1].querySelector('text').style.textAnchor = 'end';
            }
        },

        incSvgIfMinusBalance: function(data, yScalesObj) {
            var minBalance = d3.min(data, function(d) { return d['balance']});
            if ( minBalance < 0 ) {
                var minScaledBalance = yScalesObj['balanceYScale'](minBalance);
                var additionSize = Math.abs(Math.floor(minScaledBalance));

                if ( additionSize > this.brushH ) {
                    this.newSVGHeight = this.chartH + additionSize;
                    this.D3svg.attr({'height': this.newSVGHeight + 'px'});

                    this.D3leftShadow.attr({height: this.newSVGHeight});
                    this.D3rightShadow.attr({height: this.newSVGHeight});
                    this.D3pointerLines.attr({height: this.newSVGHeight});
                }
            }
        },

        translateTimeTicks: function(barWidth) {
            var ticks = d3.selectAll('.tick')[0];
            var reg = /\((.*)[,\.\s]/;
            var reg2 = /\((.*)\)/;

            for ( var i = 0, len = ticks.length; i < len; i++ ) {
                var tickTrfm = ticks[i].getAttribute('transform');
                var xTrValue = +(reg.exec(tickTrfm) || reg2.exec(tickTrfm))[1];
                ticks[i].setAttribute('transform', 'translate(' + (xTrValue + barWidth/2) + ', 0)')
            }
        },

        // STYLING CHART ELS

        styleChart: function(data, xScale, yScalesObj) {
            var barWidth = this.barWidth = this.getBarWidthForADay();

            this.styleExpense(xScale, yScalesObj, barWidth);
            this.styleDataRects(xScale, yScalesObj, barWidth);
            this.styleBalance(this.balanceData, xScale, yScalesObj, barWidth);
            this.styleRefill(xScale, yScalesObj, barWidth);

            //if ( this.lessThanAMonth ) this.translateTimeTicks(barWidth);
        },

        getBarWidthForADay: function() {
            var d1 = this.data[0]['date'];
            var d2 = new Date(this.data[0]['date'].getTime() + 1000*60*60*24);
            return Math.floor(this.xScale(d2) - this.xScale(d1));
        },

        styleExpense: function(xScale, yScalesObj, barWidth) {
            var self = this;
            var rects = d3.selectAll('rect.expense');
            var chartH = this.chartH;
            rects.attr({
                x: function(d) { return  xScale(d.date); },
                y: function(d) { return  chartH - yScalesObj.expenseYScale(d['expense']); },
                width: function(d) {
                    if ( self.moreThanAYear ) {
                        var endMonth = new Date(d.date.getFullYear(), d.date.getMonth() + 1, 0 );
                        return  (xScale(endMonth) - xScale(d.date) - 1) + 'px';
                    }
                    else {
                        return (barWidth - 1 > 1 ? barWidth - 1 : 1) + 'px';
                    }
                },
                height: function(d) { return  yScalesObj.expenseYScale(d['expense']); }
                })
                .style({fill: '#fdd74a', 'shape-rendering': 'crispEdges'});
        },

        styleDataRects: function(xScale, yScalesObj, barWidth) {
            var self = this;
            var rects = d3.selectAll('rect.data');
            var chartH = this.chartH;
            rects.attr({
                x: function(d) { return  xScale(d.date); },
                y: 0,
                width: function(d) {
                    if ( self.moreThanAYear ) {
                        var endMonth = new Date(d.date.getFullYear(), d.date.getMonth() + 1, 0 );
                        return  (xScale(endMonth) - xScale(d.date) - 1) + 'px';
                    }
                    else {
                        return (barWidth > 1 ? barWidth - 1 : 1) + 'px';
                    }
                },
                height: chartH
            })
                .style({'shape-rendering': 'crispEdges'});
        },

        styleBalance: function(data, xScale, yScalesObj, barWidth) {
            var self = this;
            var chartH = this.chartH;
            d3.selectAll('rect.balance')
                .attr({
                    x: function(d) {
                        if ( self.moreThanAYear ) {
                            var endMonth = new Date(d.date.getFullYear(), d.date.getMonth() + 1, 0 );
                            return xScale(d.date) + (xScale(endMonth) - xScale(d.date)) / 2;
                        }
                        else {
                            return xScale(d.date) + barWidth/2;
                        }
                    },
                    y: function(d) { return chartH - yScalesObj.balanceYScale(d.balance) },
                    width: '0',
                    height: '0'
                })
                .style('fill', '#d8dadc');

            var balanceLine = d3.svg.line()
                .x(function(d) { return xScale(d.date); })
                .y(function(d) { return chartH - yScalesObj.balanceYScale(d.balance) });
            balanceLine.interpolate('step-after');

            d3.select('.balance-line').attr({d: balanceLine(data)}).style({stroke: "url(#BalanceGrad)"});
        },

        styleRefill: function(xScale, yScalesObj, barWidth) {
            var self = this;
            var circles = d3.selectAll('circle.refill');
                circles.attr({
                    cx: function(d) {
                        if ( self.moreThanAYear ) {
                            var endMonth = new Date(d.date.getFullYear(), d.date.getMonth() + 1, 0 );
                            return xScale(d.date) + (xScale(endMonth) - xScale(d.date) - 1) / 2;
                        }
                        else {
                            return xScale(d.date) + barWidth/2;
                        }
                    },
                    cy: '10px',
                    r: function(d) { return yScalesObj.refillYScale(d.refill) }
                })
                .style('fill', '#4cbc5b');
        },

        // ADD BRUSH

        addBrush: function(xScale, timeAxis, dateMin, dateMax) {
            var brushExtent = (this.brushExtent.length !== 0)? this.brushExtent : [dateMin, dateMax];

            this.brush = d3.svg.brush()
                .x(xScale)
                .extent(brushExtent)
                .on('brushstart', app.ext.tools.bind(this, this.onbrushStart))
                .on('brush', app.ext.tools.bind(this, this.onbrush))
                .on('brushend', app.ext.tools.bind(this, this.onbrushEnd));

            this.D3svg.append("g")
                .attr("class", "brushG").call(this.brush);

            var brushG = d3.select('.brushG');
            this.addShadowsToTimePointers(brushG);
            this.resizeShadows();
            this.addTimePointers();

            this.showTimePointersIfTheSameDate(brushExtent);
        },

        addShadowsToTimePointers: function(brushG) {
            brushG.insert('rect', '.background')
                .attr({
                    'class': 'left-shadow',
                    x: 0 + this.leftIndent,
                    width: 0,
                    height: this.svgH})
                .style({fill: '#f0f0f0', opacity: .4});

            brushG.insert('rect', '.extent')
                .attr({
                    'class': 'right-shadow', width: 0,
                    x: this.chartWrapper.clientWidth + this.leftIndent,
                    height: this.svgH})
                .style({fill: '#f0f0f0', opacity: .4});

            this.D3leftShadow = d3.select('.left-shadow');
            this.D3rightShadow = d3.select('.right-shadow');

            d3.select('.background').remove();
            d3.select('.extent').remove();
        },

        resizeShadows: function() {
            // в IE значение атрибута transform отличается от др-х браузеров

            var reg = /\((.*)[,\.\s]/;
            var reg2 = /\((.*)\)/;

            var resizeL = this.el.querySelector('.resize.w');
            var resizeR = this.el.querySelector('.resize.e');

            var resizeLTrfm = resizeL.getAttribute('transform');
            var resizeRTrfm = resizeR.getAttribute('transform');

            var resizeLVal = reg.exec(resizeLTrfm) || reg2.exec(resizeLTrfm);
            var resizeRVal = reg.exec(resizeRTrfm) || reg2.exec(resizeRTrfm);

            this.leftShadowWidth = +resizeLVal[1] - this.leftIndent;
            this.rightShadowWidth = this.chartWrapper.clientWidth - +resizeRVal[1] + this.leftIndent;
            this.rightShadowXCoord = +resizeRVal[1];

            d3.select('.left-shadow').attr({width: this.leftShadowWidth});
            d3.select('.right-shadow').attr({x: this.rightShadowXCoord, width: this.rightShadowWidth});
        },

        addTimePointers: function() {
            d3.selectAll("g.resize.w > rect").style('shape-rendering', 'geometricPrecision')
                .attr({'class': 'pointer-line', width: '1px', x: 0, height: this.svgH})
                .style({"visibility": "visible", fill: "#aaa"});

            d3.selectAll("g.resize.e > rect")
                .attr({'class': 'pointer-line', width: '1px', x: -1, height: this.svgH})
                .style({"visibility": "visible", fill: "#aaa"});

            this.D3pointerLines = d3.selectAll('.pointer-line');

            var gResize = d3.selectAll("g.resize");
            var gResizeE = d3.selectAll("g.resize.e");

            gResize.append("circle").style('shape-rendering', 'geometricPrecision')
                .attr("class", "pointer-circle")
                .attr("r", 9)
                .attr("cy", this.chartH)
                .attr("transform", "translate(0.5, 0)")
                .style("fill", "white")
                .style("stroke", "#aaa")
                .style("stroke-width", "1px")
                .style('shape-rendering', 'geometricPrecision');

            gResizeE.select('.pointer-circle')
                .attr("transform", "translate(-0.5, 0)");

            gResize.append('path').attr({
                'class': 'pointer-arrows',
                d: 'M10.5,13.5h-1v-7h1V13.5z M5.5,10l2.9,2.9V7.1L5.5,10z M14.5,10l-2.9-2.9v5.9L14.5,10z',
                transform: 'translate(-9.5,' + (this.chartH - 10) + ')', fill: '#aaa'});

            gResizeE.select('path')
                .attr('transform', 'translate(-10.5,' + (this.chartH - 10) + ')');
        },

        showTimePointersIfTheSameDate: function(brushExtent) {
            if ( brushExtent[0].getTime() === brushExtent[1].getTime() ) {
                d3.select('.resize').style({display: 'block'});
            }
        },

        // REDRAWING

        redrawBrush: function() {
            d3.select('.brushG').remove();
            this.addBrush(this.xScale, this.timeAxis, this.chartDateMin, this.chartDateMax);
            this.incSvgIfMinusBalance(this.data, this.yScalesObj);
        },

        changeChartOnResize: function(data) {
            this.D3svg.attr({width: this.leftIndent + this.chartWrapper.clientWidth + this.rightIndent + 'px'});
            d3.select('.x-axis').remove();
            this.xScale = this.setXScale(data);
            this.addTimeAxis(this.xScale);
            this.redrawBrush();
            this.styleChart(data, this.xScale, this.yScalesObj);
        },

        redrawChart: function(data) {
            this.el.querySelector('.chart_chart-wrapper').innerHTML = '';
            this.el.querySelector('.chart_data-items-wrapper').innerHTML = '';

            this.addSvg();
            this.prepareChart(data);
            this.styleChart(data, this.xScale, this.yScalesObj);

            this.redrawBrush();
        },

        // NOTIFIER

        notifyAboutChanges: function(period) {
            var start = roundDateToDay(period[0]);
            var end = roundDateToDay(period[1]);

            app.ext.pubsub.fireEvent('period:changed', {period: [start, end]});

            function roundDateToDay(date) {
                return new Date(date.getFullYear(), date.getMonth(), date.getDate());
            }
        },

        // ALERT

        getAlertXCoord: function(e) {
            var xChart = this.el.getBoundingClientRect().left;
            var xCursor = e.clientX;
            return (xCursor - xChart) + this.leftIndent;
        },

        addAlertIfNotExists: function(e) {
            var alert = this.el.querySelector('.chart_alert');
            if ( !alert ) {
                this.alert = document.createElement('div');
                var xAlert = this.getAlertXCoord(e);
                this.alert.className = 'chart_alert';
                this.alert.style.left =  (xAlert - this.leftIndent) + 'px';
                this.alert.style.height = this.svgH + 'px';
                this.alert.innerHTML = app.ext.tmp(document.getElementById('Alert').innerHTML)();
                this.el.appendChild(this.alert);
                this.alertContent = this.alert.querySelector('.chart_alert-content');
            }
        },

        removeAlertIfExists: function() {
            var alert = this.el.querySelector('.chart_alert');
            if ( alert ) {
                alert.parentNode.removeChild(alert);
                this.alert = null;
                this.alertContent = null;
                this.alertContentReversed = false;
            }
        },

        addDataToAlert: function(date) {
            var o = this.findObjDataToDisplayInAlert(date);
            var oBalance = this.findObjDataToDisplayBalanceInAlert(date);

            var dateEl = this.el.querySelector('.chart_alert-date');
            var expenseEl = this.el.querySelector('.chart_alert-item._expense .chart_alert-item-value');
            var refillEl = this.el.querySelector('.chart_alert-item._refill .chart_alert-item-value');
            var balanceEl = this.el.querySelector('.chart_alert-item._balance .chart_alert-item-value');

            if (this.alert) {
                expenseEl.innerHTML = (this.foundLessDate || o.expense == '0')? '0,00' : app.ext.tools.numToStr(o.expense);
                refillEl.innerHTML = (this.foundLessDate || o.refill == '0')? '+0,00' : '+' +  app.ext.tools.numToStr(o.refill);
                balanceEl.innerHTML = app.ext.tools.numToStr(oBalance.balance);
            }

            this.setDateToAlert(dateEl, date);
        },

        findObjDataToDisplayInAlert: function(date) {
            this.foundLessDate = false;
            var d = (this.moreThanAYear)? new Date(date.getFullYear(), date.getMonth()) :
                new Date(date.getFullYear(), date.getMonth(), date.getDate());

            for ( var i = this.data.length - 1; i >= 0; i-- ) {
                var dataDate = (this.moreThanAYear)?
                    new Date(this.data[i].date.getFullYear(), this.data[i].date.getMonth()) : this.data[i].date;

                if ( dataDate.getTime() === d.getTime() ) {
                    return this.data[i];
                }
                if ( dataDate.getTime() < d.getTime() && !this.foundLessDate ) {
                    this.foundLessDate = true;
                    return this.data[i];
                }
                if ( i === 0 ) return this.data[0];
            }
        },

        findObjDataToDisplayBalanceInAlert: function(date) {
            this.foundLessBalanceDate = false;
            var d = (this.moreThanAYear)? new Date(date.getFullYear(), date.getMonth()) :
                new Date(date.getFullYear(), date.getMonth(), date.getDate());

            for ( var i = this.balanceData.length - 1; i >= 0; i-- ) {
                var dataDate = (this.moreThanAYear)?
                    new Date(this.balanceData[i].date.getFullYear(), this.balanceData[i].date.getMonth()) : this.balanceData[i].date;

                if ( dataDate.getTime() === d.getTime() ) {
                    return this.balanceData[i];
                }
                if ( dataDate.getTime() < d.getTime() && !this.foundLessBalanceDate ) {
                    this.foundLessBalanceDate = true;
                    return this.balanceData[i];
                }
                if ( i === 0 ) return this.balanceData[0];
            }
        },

        setDateToAlert: function(dateEl, date) {
            if ( date.getTime() < this.dateMin.getTime() ) date = this.dateMin;
            if ( date.getTime() > this.dateMax.getTime() ) date = this.dateMax;

            var strDate = app.ext.tools.dateToStr(date, '.');
            var monthNames = app.ext.tools[this.en ? 'monthWordHashEn' : 'monthWordHash2'];
            var strDateArr = strDate.split('.');
            var strDateWithFullMonth;

            if ( this.moreThanAYear ){
                strDateWithFullMonth = monthNames[strDateArr[1]] + ' ' + strDateArr[2];
            } else {
                strDateWithFullMonth = app.ext.tools.dateStrToStrWithFullMonth(strDate, this.en ? 'en' : 'ru');
            }

            if ( dateEl ) dateEl.innerHTML = strDateWithFullMonth;
        },

        handleResizeMouseover: function(e) {
            var el = document.elementFromPoint(e.clientX, e.clientY);
            if ( el.getAttribute('class') === 'pointer-circle' || el.getAttribute('class') === 'pointer-arrows' ) {
                this.enteredResizeEl = true;
                this.removeAlertIfExists();
            } else {
                this.enteredResizeEl = false;
                this.addAlertIfNotExists(e);
            }
        },

        handleAlertPresence: function(e, date) {
            if ( !this.enteredResizeEl ) {
                if ( date.getTime() < this.chartDateMin.getTime() || date.getTime() > this.chartDateMax.getTime() ) {
                    this.removeAlertIfExists();
                } else {
                    this.addAlertIfNotExists(e)
                }
            }
        },

        handleAlertContentDirection: function() {
            if ( this.alert ) {
                var rightCoordAlertContent = this.alert.getBoundingClientRect().right + this.alertContent.offsetWidth;
                var rightCoordChart = this.el.getBoundingClientRect().right;
                if ( rightCoordAlertContent >= rightCoordChart ) {
                    if ( !this.alertContentReversed ) {
                        this.alertContent.classList.add('_reverse');
                        this.alertContentReversed = true;
                    }
                } else {
                    if ( this.alertContentReversed ) {
                        this.alertContent.classList.remove('_reverse');
                        this.alertContentReversed = false;
                    }
                }
            }
        },

        // EVENTS

        bindEvents: function() {
            app.ext.tools.addListener(this.el, 'mousemove', app.ext.tools.bind(this, this.onmousemoveChart));
            app.ext.tools.addListener(this.el, 'mouseleave', app.ext.tools.bind(this, this.onmouseleaveChart));
            //app.ext.tools.addListener(this.el, 'mouseover', app.ext.tools.bind(this, this.onmouseoverChart));
            //app.ext.tools.addListener(this.el, 'mouseout', app.ext.tools.bind(this, this.onmouseoutChart));
            app.ext.tools.addListener(window, 'resize', app.ext.tools.bind(this, this.onresize));

            app.ext.pubsub.addListener('cardsFilter:changed', app.ext.tools.bind(this, this.onCardsFilterChange));
            app.ext.pubsub.addListener('chart-pointers:move', app.ext.tools.bind(this, this.onPeriodChange));
        },

        onmouseoverChart: function(e) {
            if (e.target.classList.contains('data') ) {
                this.dataEl = e.target;
                this.dataEl.classList.add('-hovered');
            }
            else if ( e.target.classList.contains('expense') || e.target.classList.contains('refill') ) {
                for ( var i = 0, len = this.dataRects.length; i < len; i++ ) {
                    if ( this.dataRects[i].__data__['date'].getTime() === e.target.__data__['date'].getTime() ) {
                        this.dataEl = this.dataRects[i];
                        this.dataEl.classList.add('-hovered');
                    }
                }
            }
        },

        onmouseoutChart: function(e) {
            if (e.target.classList.contains('data') || e.target.classList.contains('expense') || e.target.classList.contains('refill') ) {
                if ( this.dataEl ) {
                    this.dataEl.classList.remove('-hovered');
                    this.dataEl = null;
                }
            }
        },

        onmouseleaveChart: function() {
            this.removeAlertIfExists();
        },

        onmousemoveChart: function(e) {
            if ( this.brushing || app.historyDropdownOpened ) return false;
            var xAlert = this.getAlertXCoord(e);

            var date = this.xScale.invert(xAlert);

            this.handleResizeMouseover(e);
            this.handleAlertPresence(e, date);

            this.addDataToAlert(date);
            this.handleAlertContentDirection();

            if ( this.alert ) this.alert.style.left = (xAlert - this.leftIndent) + 'px';
        },

        onresize: function() {
            this.changeChartOnResize(this.data);
        },

        onbrush: function() {
            this.removeAlertIfExists();

            var period = this.brush.extent();
            if ( period[0].getTime() < this.dateMin.getTime() ) period[0] = this.dateMin;
            if ( period[1].getTime() > this.dateMax.getTime() ) period[1] = this.dateMax;

            app.ext.pubsub.fireEvent('chart-pointers:moved', {period: period});
            this.resizeShadows();
        },

        onbrushStart: function() {
            this.brushing = true;
        },

        onbrushEnd: function() {
            this.brushing = false;
            this.brushExtent = this.brush.extent();

            this.showTimePointersIfTheSameDate(this.brushExtent);

            this.notifyAboutChanges(this.brushExtent);
        },

        onCardsFilterChange: function(o) {
            this.filters['cards'] = o.cards;
            this.prepareFilteredData(this.parent.jsonData);
            this.redrawChart(this.data);
        },

        onPeriodChange: function(o) {
            var period = o.period;
            if ( o.dateMin ) period[0] = this.chartDateMin;
            if ( o.dateMax ) period[1] = this.chartDateMax;
            this.brushExtent = period;
            this.redrawBrush();
        }
    };

    return {
        init: function() {
            var chart = document.querySelector('.b-chart');
            if ( chart !== null ) {
                app.module.chart = new Chart({el: chart, parent: app.module.history});
            }
        }
    }
});