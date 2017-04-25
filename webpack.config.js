var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require("path");

module.exports = {

    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js']
    },

    entry: {
        app: './app/src/Game.ts',
        includes: './app/includes.js'
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: "Intro",
            filename: "index.html",
            cutscene:"intro-720p.webm",
            level: "level1.html",
            template: "app/templates/cutscene.ejs",
            chunks: []
        }),
        new HtmlWebpackPlugin({title: 'Power Department - Level 1', filename: "level1.html"}),
        new HtmlWebpackPlugin({
            title: "Cutscene",
            filename: "level2intro.html",
            cutscene:"bastards.webm",
            level: "level2.html",
            template: "app/templates/cutscene.ejs",
            chunks: []
        }),
        new HtmlWebpackPlugin({title: 'Power Department - Level 2', filename: "level2.html"}),
        new HtmlWebpackPlugin({
            title: "Cutscene",
            filename: "level3intro.html",
            cutscene:"warning-2.webm",
            level: "level3intro2.html",
            template: "app/templates/cutscene.ejs",
            chunks: []
        }),
        new HtmlWebpackPlugin({
            title: "Cutscene",
            filename: "level3intro2.html",
            cutscene:"ridiculous.webm",
            level: "level3.html",
            template: "app/templates/cutscene.ejs",
            chunks: []
        }),
        new HtmlWebpackPlugin({title: 'Power Department - Level 3', filename: "level3.html"}),
        new HtmlWebpackPlugin({
            title: "Cutscene",
            filename: "level4intro.html",
            cutscene:"we-are-close-indeed.webm",
            level: "level4.html",
            template: "app/templates/cutscene.ejs",
            chunks: []
        }),
        new HtmlWebpackPlugin({title: 'Power Department - Level 4', filename: "level4.html"}),
        new HtmlWebpackPlugin({
            title: "Cutscene",
            filename: "outro.html",
            cutscene:"outro.webm",
            level: "",
            template: "app/templates/cutscene.ejs",
            chunks: []
        }),
        new webpack.optimize.CommonsChunkPlugin({name: 'includes', filename: 'includes.bundle.js'}),
        new ExtractTextPlugin('styles.css')
    ],

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },

    devtool: 'source-map',

    module: {
        loaders: [
            {test: /\.ts$/, loader: 'ts-loader'},
            {test: /\.css$/, loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader'})}
        ]
    }
};
