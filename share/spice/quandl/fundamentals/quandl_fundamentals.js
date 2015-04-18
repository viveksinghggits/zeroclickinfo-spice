/**
* Created with DuckDuckHack.
* User: brianrisk
* Date: 2015-02-12
* Time: 04:37 PM
* To change this template use Tools | Templates.
*/

(function (env) {
    'use strict';
    env.ddg_spice_quandl_fundamentals = function(api_result){

        if (!api_result) {
            return Spice.failed('quandl_fundamentals');
        }

        var result = api_result;

        // we need two data points to get percent change
        if (result.data.length < 2) {
            return Spice.failed('quandl_fundamentals');
        }

        // url to the data set page
        result.url = 'https://quandl.com/' + result.source_code + "/" + result.code;

        // add title tag for link:
        result.urlTitle = 'View more fundamentals data at Quandl';

        var recentValue = result.data[0][1];
        var previousValue = result.data[1][1];

        // splitting title into header and subheader
        var dashIndex = result.name.indexOf("-");
        var headerFirst =result.name.substring(0,dashIndex).trim();
        var headerSecond = result.name.substring(dashIndex + 1, result.name.length).trim();
        result.header = headerFirst;
        result.subheader = headerSecond;

        // getting rounded percentage
        var percentChange = 10000 * ((recentValue - previousValue) / Math.abs(previousValue));
        percentChange = Math.round(percentChange);
        percentChange /= 100;
        result.change_percent = Math.abs(percentChange);

        // setting style based on change
        if (percentChange > 0) result.changeDirection = 'up';
        if (percentChange < 0) result.changeDirection = 'down';
        if (percentChange == 0) result.changeDirection = 'up';

        // the most recent fundamental value
        var value = recentValue;
        if (Math.abs(value) >= Math.pow(10,12)) {
            value = Math.round(value / Math.pow(10,10)) / Math.pow(10,2);
            value = "$" + value + " trillion";
        } else if (Math.abs(value) >= Math.pow(10,9)) {
            value = Math.round(value / Math.pow(10,7)) / Math.pow(10,2);
            value = "$" + value + " billion";
        } else if (Math.abs(value) >= Math.pow(10,6)) {
            value = Math.round(value / Math.pow(10,4)) / Math.pow(10,2);
            value = "$" + value + " million";
        } else if (Math.abs(value) >= Math.pow(10,3)) {
            value = Math.round(value / Math.pow(10,1)) / Math.pow(10,2);
            value = "$" + value + " thousand";
        }
        result.value = value;


        DDG.require('moment.js', function() {
            Spice.add({
                id: 'quandl_fundamentals',
                name: 'Fundamentals',
                data: result,
                meta: {
                    sourceName: 'Quandl',
                    sourceUrl: result.url,
                    sourceIconUrl:  DDG.get_asset_path('quandl/fundamentals','quandl32x32.png')
                },
                normalize: function(item) {
                    var to_date = moment(item.to_date).format('MMM DD, YYYY');
                    var from_date = moment(item.data[1][0]).format('MMM DD, YYYY');
                    return {
                        title: item.header,
                        url: item.url,
                        subtitle: item.subheader + ' as of ' + to_date
                    }
                },
                templates: {
                    group: 'text',
                    options: {
                        content: Spice.quandl_fundamentals.content,
                        moreAt: true
                    }
                }
            });
        });
    };
}(this));

