const path = require("path");
const {VueLoaderPlugin} = require("vue-loader");


module.exports = (env = {})=>({
    mode: "development",
    output: {
        path: path.resolve(__dirname,"public/dist"),
        publicPath: "/dist/"
    },
    resolve:{
        alias: {
            vue: "@vue/runtime-dom"
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: "vue-loader"
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.svg/,
                use: {
                    loader: "svg-url-loader"
                },
            },
        ]
    },
    cache: {
        type: 'filesystem'
    },
    plugins: [
        new VueLoaderPlugin()
    ],
})