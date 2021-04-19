const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const webpack = require("webpack");

module.exports = [
    new VueLoaderPlugin(),
    // new webpack.NormalModuleReplacementPlugin(/typeorm$/, function(result) {
    //     result.request = result.request.replace(/typeorm/, "typeorm/browser");
    // }),
    // new webpack.ProvidePlugin({
    //     "window.SQL": "sql.js/dist/sql-wasm.js",
    // }),
];
