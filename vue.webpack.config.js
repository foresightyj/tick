const path = require("path");

module.exports = {
    module: {
        rules: [{
            test: /core-prototypes\.js$/,
            //see https://webpack.js.org/configuration/module/#condition
            use: [{
                loader: 'string-replace-loader',
                options: {
                    search: 'output = parseStandardFormats.call',
                    replace: 'var output = parseStandardFormats.call',
                    flags: 'ms',
                }
            }]
        }],
    }
};
