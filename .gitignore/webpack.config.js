// Look in ./config folder for webpack.dev.js
switch (process.env.NODE_ENV) {
  case 'prod':
  case 'production':
    module.exports = require('./config/webpack.prod');
    break;
  case 'qa':
  case 'test':
    module.exports = require('./config/webpack.qa');
    break;
  case 'dev':
  case 'development':
  default:
    module.exports = require('./config/webpack.dev');
}


// var ExtractTextPlugin = require('extract-text-webpack-plugin');
// var webpack = require('webpack');
// var HtmlWebpackPlugin = require('html-webpack-plugin');

// module.exports = {
//     entry: {
//         'polyfills': './src/polyfills.ts',
//         'vendor': './src/vendor.ts',
//         'app': './src/main.ts'
//     },
//     resolve: {
//         extensions: ['', '.ts', '.js', '.css', '.html']
//     },
//     output: {
//         filename: '[name].bundle.js'
//     },
//     module: {
//         loaders: [
//             {
//                 test: /\.ts$/,
//                 loader: 'ts'
//             },
//             {
//                 test: /\.html$/,
//                 loader: 'html'
//             },
//             {
//                 test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
//                 loader: 'file?name=fonts/[name].[hash].[ext]'
//             },
//             {
//                 test: /\.css$/,
//                 exclude: './src/app',
//                 loader: ExtractTextPlugin.extract('style', 'css?sourceMap')
//             },
//             {
//                 test: /\.css$/,
//                 include: './src/app',
//                 loader: 'raw'
//             }
//         ]
//     },
//     plugins: [
//         new ExtractTextPlugin('[name].bundle.css'),
//         new webpack.optimize.CommonsChunkPlugin({
//             name: ['app', 'vendor', 'polyfills']
//          })
//     //,
//     // new HtmlWebpackPlugin({
//     //   template: 'src/index.html',
//     //   chunksSortMode: 'dependency'      
//     // })        
//     ],
//     devServer: {
//         historyApiFallback: true,
//         stats: 'minimal'
//     }
// };