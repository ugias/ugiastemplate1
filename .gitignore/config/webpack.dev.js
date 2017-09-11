// var webpackMerge = require('webpack-merge');
// var ExtractTextPlugin = require('extract-text-webpack-plugin');
// var commonConfig = require('./webpack.common.js');
// var helpers = require('./helpers');

// module.exports = webpackMerge(commonConfig, {
//   devtool: 'cheap-module-eval-source-map',

//   output: {
//     path: helpers.root('dist'),
//     publicPath: 'http://localhost:8080/',
//     filename: '[name].js',
//     chunkFilename: '[id].chunk.js'
//   },

//   plugins: [
//     new ExtractTextPlugin('[name].css')
//   ],

//   tslint: {
//     emitErrors: false,
//     failOnHint: false,
//     resourcePath: 'src'
//   },

//   devServer: {
//     historyApiFallback: true,
//     stats: 'minimal'
//   }
// });

var webpackMerge = require('webpack-merge');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var commonConfig = require('./webpack.common.js');
var helpers = require('./helpers');
const DefinePlugin = require('webpack/lib/DefinePlugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
const HMR = helpers.hasProcessFlag('hot');
const METADATA = webpackMerge(commonConfig.metadata, {
  host: HOST,
  port: PORT,
  ENV: ENV,
  HMR: HMR
});

/*
 * Webpack configuration
*/
module.exports = webpackMerge(commonConfig, {

  /**
   * Merged metadata from webpack.common.js for index.html
   *
   * See: (custom attribute)
   */
  metadata: METADATA,
  debug: true,
  //devtool: 'source-map',  
  devtool: '#inline-source-map',  
  //devtool: 'cheap-module-source-map',

  //Options affecting the output of the compilation.
  output: {
    path: helpers.root('src'),
    publicPath: 'http://localhost:8080/',    
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].map',
    chunkFilename: '[id].chunk.js'

    // library: 'ac_[name]',
    // libraryTarget: 'var',
  },

  plugins: [
    new ExtractTextPlugin('[name].bundle.css'),
    new DefinePlugin({
      'ENV': JSON.stringify(METADATA.ENV),
      'HMR': METADATA.HMR,
      'process.env': {
        'ENV': JSON.stringify(METADATA.ENV),
        'NODE_ENV': JSON.stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
        'API_HOST': JSON.stringify('http://localhost:8081/')
      }
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      chunksSortMode: 'dependency'      
    })    
  ],

  /*
   * Static analysis linter for TypeScript advanced options configuration
   * Description: An extensible linter for the TypeScript language.
  */
  tslint: {
    emitErrors: false,
    failOnHint: false,
    resourcePath: 'src'
  },

  /*
   * Webpack Development Server configuration
  */
  devServer: {
    // port: METADATA.port,
    // host: METADATA.host,
    // historyApiFallback: true,
    // watchOptions: {
    //   aggregateTimeout: 300,
    //   poll: 1000
    // },
    historyApiFallback: true,
    stats: 'minimal'
  },

  /*
   * Include polyfills or mocks for various node stuff
   * Description: Node configuration
 */
  node: {
    global: 'window',
    crypto: 'empty',
    process: true,
    module: false,
    clearImmediate: false,
    setImmediate: false
  }

});
