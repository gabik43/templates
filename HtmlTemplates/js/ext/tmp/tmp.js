app.register('ext', 'tmp', function() {
    return function(html) {
            html = app.ext.tools.trim(html).replace(/\n/g, ' ').replace(/\s+/, ' ');
            var reg = /<%=?([\s\S]+?)%>/g;
            var match;
            var code = 'var ar = [];\n';
            var cursor = 0;

            function addToCode(str, addFlag, match0) {
                if ( !addFlag ) {
                    if ( match0.match(/<%=/) ) {
                        code += 'ar.push(' + str.replace(/"/g, '\\"') + ');\n';
                    } else {
                        code += str + '\n';
                    }
                } else {
                    code += 'ar.push("' + str.replace(/"/g, '\\"') + '");\n';
                }
            }

            while ( match = reg.exec(html) ) {
                addToCode(html.slice(cursor, match.index), true);
                addToCode(match[1], false, match[0]);
                cursor = match.index + match[0].length;
            }

            addToCode(html.slice(cursor), true);

            code += 'return ar.join("");';

            return new Function( 'data', code.replace(/[\n\r\t]/g, '') );
        }

});