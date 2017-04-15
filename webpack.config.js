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
    new HtmlWebpackPlugin({ title: 'My Game' }),
    new webpack.optimize.CommonsChunkPlugin({name:'includes', filename:'includes.bundle.js'}),
    new ExtractTextPlugin('styles.css')
  ],

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },

  devtool: 'source-map',

  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts-loader' },
      { test: /\.css$/, loader: ExtractTextPlugin.extract({fallback:'style-loader', use:'css-loader'}) }
    ]
  }
};
