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
        new HtmlWebpackPlugin({title: 'Power Department - Level 1', filename: "level1.html"}),
        new HtmlWebpackPlugin({title: 'Power Department - Level 2', filename: "level2.html"}),
        new HtmlWebpackPlugin({title: 'Power Department - Level 3', filename: "level3.html"}),
        new HtmlWebpackPlugin({title: 'Power Department - Level 4', filename: "level4.html"}),
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
