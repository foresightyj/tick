const webpackConfig = require("./vue.webpack.config.js");

module.exports = {
    pages: {
        command: "src/pages/command/command.ts",
        schedules: "src/pages/schedules/schedules.ts",
    },
    configureWebpack:webpackConfig
}
