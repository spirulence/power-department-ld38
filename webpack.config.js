/*  Copyright (c) 2017 Cameron B Seebach
 *  Copyright (c) 2015 Geoffroy Warin
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

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
            title: "Power Department main menu",
            filename: "index.html",
            template: "app/templates/menu.ejs",
            chunks: []
        }),
        new HtmlWebpackPlugin({title: 'Power Department Tutorial', filename: "tutorial.html"}),
        new HtmlWebpackPlugin({
            title: "Intro",
            filename: "level1intro.html",
            cutscene:"01-intro",
            level: "level1.html",
            template: "app/templates/cutscene.ejs",
            chunks: []
        }),
        new HtmlWebpackPlugin({title: 'Power Department - Level 1', filename: "level1.html"}),
        new HtmlWebpackPlugin({
            title: "Cutscene",
            filename: "level2intro.html",
            cutscene:"02_board_meeting",
            level: "level2.html",
            template: "app/templates/cutscene.ejs",
            chunks: []
        }),
        new HtmlWebpackPlugin({title: 'Power Department - Level 2', filename: "level2.html"}),
        new HtmlWebpackPlugin({
            title: "Cutscene",
            filename: "level3intro.html",
            cutscene:"03_warning",
            level: "level3intro2.html",
            template: "app/templates/cutscene.ejs",
            chunks: []
        }),
        new HtmlWebpackPlugin({
            title: "Cutscene",
            filename: "level3intro2.html",
            cutscene:"ridiculous",
            level: "level3.html",
            template: "app/templates/cutscene.ejs",
            chunks: []
        }),
        new HtmlWebpackPlugin({title: 'Power Department - Level 3', filename: "level3.html"}),
        new HtmlWebpackPlugin({
            title: "Cutscene",
            filename: "level4intro.html",
            cutscene:"we-are-close-indeed",
            level: "level4.html",
            template: "app/templates/cutscene.ejs",
            chunks: []
        }),
        new HtmlWebpackPlugin({title: 'Power Department - Level 4', filename: "level4.html"}),
        new HtmlWebpackPlugin({
            title: "Cutscene",
            filename: "outro.html",
            cutscene:"outro",
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

    devtool: 'cheap-eval-source-map',

    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader'})},
            {
                test: path.resolve(__dirname, 'node_modules/webpack-dev-server/client'),
                loader: "null-loader"
            }
        ]
    },

    devServer:{
        port: 9000
    }
};
