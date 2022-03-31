module.exports = [
    // Add support for native node modules
    {
        test: /\.node$/,
        use: "node-loader",
    },
    {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
            {
                loader: "babel-loader",
            },
        ],
    },

    {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: [
            "babel-loader",
            {
                loader: "ts-loader",
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                },
            },
        ],
    },
    {
        test: /\.vue$/,
        use: "vue-loader",
        exclude: /node_modules/,
    },
    {
        test: /\.(post)?css$/,
        use: [
            "style-loader",
            {
                loader: "css-loader",
                options: {
                    importLoaders: 1,
                },
            },
            "postcss-loader",
        ],
    },
    {
        test: /\.(png|jpg|gif|eot|svg|ttf|woff|woff2)$/i,
        use: [
            {
                loader: "url-loader",
                // options: {
                //     limit: 8192,
                // },
            },
        ],
    },
    {
        test: /\.node$/,
        use: "node-loader",
    },
    {
        test: /\.(m?js|node)$/,
        parser: { amd: false },
        use: {
            loader: "@timfish/webpack-asset-relocator-loader",
            options: {
                outputAssetBase: "native_modules",
            },
        },
    },
];
