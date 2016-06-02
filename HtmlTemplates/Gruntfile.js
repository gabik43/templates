module.exports = function(grunt){

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        cssmin: {
            minify: {
                src: ['css/*.css'],
                dest: 'pressed/css/common.css'
            }
        },

        uglify: {
            minify: {
                files: {
                    'pressed/js/ru/common.js': [
                        'js/lib/classList.js',
                        'js/app.js',

                        'js/handbooks/mcc.js',
                        'js/handbooks/categories-colors.js',
                        'js/handbooks/ru/categories.js',
                        'js/handbooks/ru/countries.js',
                        'js/handbooks/ru/cities.js',

                        'js/ext/browser-type/browser-type.js',
                        'js/ext/pubsub/pubsub.js',
                        'js/ext/tools/tools.js',
                        'js/ext/mediaIE8/mediaIE8.js',
                        'js/ext/tmp/tmp.js',

                        'js/ui/datepicker/datepicker.js',

                        'js/modules/title/title.js',
                        'js/modules/main/main.js',
                        'js/modules/card-opers/card-opers.js',
                        'js/modules/state/state.js',
                        'js/modules/balance/balance.js',
                        'js/modules/past-period/past-period.js',
                        'js/modules/card/card.js',
                        'js/modules/extra-cards/extra-cards.js',
                        'js/modules/extra-card/extra-card.js',
                        'js/modules/card-info/card-info.js',
                        'js/modules/history/history.js',
                        'js/modules/history/categories/categories.js',
                        'js/modules/history/search/search.js',
                        'js/modules/history/trs/trs.js',
                        'js/modules/history/cards-filter/cards-filter.js',
                        'js/modules/history/chart/chart.js',
                        'js/modules/history/period/period.js',
                        'js/modules/history/shortcuts/shortcuts.js',

                        'js/app-start.js'
                    ]
                }
            },
            minifyEn: {
                files: {
                    'pressed/js/en/common.js': [
                        'js/lib/classList.js',
                        'js/app.js',

                        'js/handbooks/mcc.js',
                        'js/handbooks/categories-colors.js',
                        'js/handbooks/en/categories.js',
                        'js/handbooks/en/countries.js',
                        'js/handbooks/en/cities.js',

                        'js/ext/browser-type/browser-type.js',
                        'js/ext/pubsub/pubsub.js',
                        'js/ext/tools/tools.js',
                        'js/ext/mediaIE8/mediaIE8.js',
                        'js/ext/tmp/tmp.js',

                        'js/ui/datepicker/datepicker.js',

                        'js/modules/title/title.js',
                        'js/modules/main/main.js',
                        'js/modules/card-opers/card-opers.js',
                        'js/modules/state/state.js',
                        'js/modules/balance/balance.js',
                        'js/modules/past-period/past-period.js',
                        'js/modules/card/card.js',
                        'js/modules/extra-cards/extra-cards.js',
                        'js/modules/extra-card/extra-card.js',
                        'js/modules/card-info/card-info.js',
                        'js/modules/history/history.js',
                        'js/modules/history/categories/categories.js',
                        'js/modules/history/search/search.js',
                        'js/modules/history/trs/trs.js',
                        'js/modules/history/cards-filter/cards-filter.js',
                        'js/modules/history/chart/chart.js',
                        'js/modules/history/period/period.js',
                        'js/modules/history/shortcuts/shortcuts.js',

                        'js/app-start.js'
                    ]
                }
            }
        },

        // кодирует иконки партнерок и плат систем
        base64: {
            target: {
                files: {
                    'i/paysys/base64/A1-A2.txt': ['i/paysys/A1-A2.png'],
                    'i/paysys/base64/A3-A4.txt': ['i/paysys/A3-A4.png'],
                    'i/paysys/base64/CM-CT.txt': ['i/paysys/CM-CT.png'],
                    'i/paysys/base64/MB.txt': ['i/paysys/MB.png'],
                    'i/paysys/base64/MG-MGM.txt': ['i/paysys/MG-MGM.png'],
                    'i/paysys/base64/MP.txt': ['i/paysys/MP.png'],
                    'i/paysys/base64/MS-MQ-MQM-MQY.txt': ['i/paysys/MS-MQ-MQM-MQY.png'],
                    'i/paysys/base64/MV.txt': ['i/paysys/MV.png'],
                    'i/paysys/base64/MW-MR.txt': ['i/paysys/MW-MR.png'],
                    'i/paysys/base64/PM.txt': ['i/paysys/PM.png'],
                    'i/paysys/base64/PP-PC-PS-PR-PO-UE.txt': ['i/paysys/PP-PC-PS-PR-PO-UE.png'],
                    'i/paysys/base64/VB.txt': ['i/paysys/VB.png'],
                    'i/paysys/base64/VC-VCA-VCO-VCY-VCZ.txt': ['i/paysys/VC-VCA-VCO-VCY-VCZ.png'],
                    'i/paysys/base64/VE-VT.txt': ['i/paysys/VE-VT.png'],
                    'i/paysys/base64/VG-VGA-VGG-VGZ-.txt': ['i/paysys/VG-VGA-VGG-VGZ-.png'],
                    'i/paysys/base64/VI-PV.txt': ['i/paysys/VI-PV.png'],
                    'i/paysys/base64/VP-VPZ-VR.txt': ['i/paysys/VP-VPZ-VR.png'],
                    'i/paysys/base64/VV.txt': ['i/paysys/VV.png'],
                    'i/partners/base64/MPS_25.txt': ['i/partners/MPS_25.png'],
                    'i/partners/base64/MPS_27.txt': ['i/partners/MPS_27.png'],
                    'i/partners/base64/MPS_29.txt': ['i/partners/MPS_29.png'],
                    'i/partners/base64/MPS_30.txt': ['i/partners/MPS_30.png']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-base64');

    grunt.registerTask('base64', ['base64']);
    grunt.registerTask('default', ['cssmin:minify', 'uglify:minify', 'uglify:minifyEn']);
};