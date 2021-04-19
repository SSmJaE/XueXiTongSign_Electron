const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");
const path = require("path");

// rules.push({
//     test: /\.css$/,
//     use: [{ loader: "style-loader" }, { loader: "css-loader" }],
// });

module.exports = {
    module: {
        rules,
    },
    plugins: plugins,
    resolve: {
        extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".vue"],
        alias: {
            "@src": path.resolve(__dirname, "./src/"),
            "@main": path.resolve(__dirname, "./src/main/"),
            "@renderer": path.resolve(__dirname, "./src/renderer/"),
            "@components": path.resolve(__dirname, "./src/renderer/components/"),
            "@store": path.resolve(__dirname, "./src/renderer/store/"),
        },
    },
};
