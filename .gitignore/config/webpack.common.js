var webpack = require('webpack');
var helpers = require('./helpers');

 // Webpack Plugins
var CopyWebpackPlugin = (CopyWebpackPlugin = require('copy-webpack-plugin'), CopyWebpackPlugin.default || CopyWebpackPlugin);
var HtmlWebpackPlugin = require('html-webpack-plugin');
//var ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;
var ExtractTextPlugin = require('extract-text-webpack-plugin');
//var HtmlElementsPlugin = require('./html-elements-plugin');
var SassLintPlugin = require('sasslint-webpack-plugin');

module.exports = {
  entry: {
    'polyfills': './src/polyfills.ts',
    'vendor': './src/vendor.ts',
    'app': './src/main.ts'
  },

  resolve: {
    extensions: ['', '.js', '.ts']
  },

  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts',
        exclude: [/\.(spec|e2e)\.ts$/]        
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.html$/,
        loader: 'html',
        exclude: [helpers.root('src/index.html')]        
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        loader: 'file?name=assets/[name].[ext]'
      },
      {
        test: /\.(svg|woff|woff2|ttf|eot|ico)$/,
        loader: 'file?name=assets/fonts/[name].[ext]'
      },
      {
        test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
        loader: 'url-loader?name=assets/fonts/[name].[ext]'
      },
      {
        test: /\.css$/,
        exclude: helpers.root('src'),
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap')
      },
      {
        test: /\.css$/,
        include: helpers.root('src'),
        loader:ExtractTextPlugin.extract('style', 'css?sourceMap')
      },
      {
        test: /\.less$/,
        exclude: '/node_modules/',
        loader:ExtractTextPlugin.extract('style', 'css?sourceMap!less')        
      }
    ]
  },

  plugins: [
    // new SassLintPlugin({
    //   glob: 'src/**/*.scss'
    // }),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills']
    }),
    new CopyWebpackPlugin([
      {from: 'src/assets', to: 'assets'}
      // , {from: 'node_modules/egeo.ui.base/src/vendors/fonts', to: 'assets/fonts'}
      ])
  ]
};
