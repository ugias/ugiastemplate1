// const helpers = require('./helpers');
// const ProvidePlugin = require('webpack/lib/ProvidePlugin');
// const DefinePlugin = require('webpack/lib/DefinePlugin');
// const ENV = process.env.ENV = process.env.NODE_ENV = 'test';

// module.exports = {
//   devtool: 'inline-source-map',
//   resolve: {
//     extensions: ['', '.ts', '.js'],
//     root: helpers.root('src'),
//   },
//   module: {
//     preLoaders: [
//       {
//         test: /\.ts$/,
//         loader: 'tslint-loader',
//         exclude: [helpers.root('node_modules')]
//       },
//       {
//         test: /\.js$/,
//         loader: 'source-map-loader',
//         exclude: [
//         // these packages have problems with their sourcemaps
//         helpers.root('./node_modules/rxjs'),
//         helpers.root('./node_modules/@angular')
//       ]}
//     ],
//     loaders: [
//       {
//         test: /\.ts$/,
//         loader: 'ts',
//         query: {
//           compilerOptions: {
//             // Remove TypeScript helpers to be injected
//             // below by DefinePlugin
//             removeComments: true
//           }
//         },
//         exclude: [/\.e2e\.ts$/]
//       },
//       { test: /\.json$/, loader: 'json-loader', exclude: [helpers.root('src/index.html')] },
//       { test: /\.css$/, loaders: null },
//       { test: /\.html$/, loader: 'raw-loader', exclude: [helpers.root('src/index.html')] }
//     ],
//     postLoaders: [
//       {
//         test: /\.(js|ts)$/, loader: 'istanbul-instrumenter-loader',
//         include: helpers.root('src'),
//         exclude: [
//           /\.(e2e|spec)\.ts$/,
//           /node_modules/
//         ]
//       }
//     ]
//   },
//   plugins: [
//     new DefinePlugin({
//       'ENV': JSON.stringify(ENV),
//       'HMR': false,
//       'process.env': {
//         'ENV': JSON.stringify(ENV),
//         'NODE_ENV': JSON.stringify(ENV),
//         'HMR': false,
//       }
//     }),
//   ],
//   tslint: {
//     emitErrors: false,
//     failOnHint: false,
//     resourcePath: 'src'
//   },
//   node: {
//     global: 'window',
//     process: false,
//     crypto: 'empty',
//     module: false,
//     clearImmediate: false,
//     setImmediate: false
//   }
// };

//'use strict';
const helpers = require('./helpers');
const path = require('path');
const webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool: 'inline-source-map',
    module: {
        preLoaders: [
            {
                loader: 'tslint',
                test: /.ts$/
            }
        ],
        loaders: [
            {
                loader: 'raw',
                test: /\.(html|scss)$/
            },
            {
                exclude: /node_modules/,
                loader: 'ts',
                test: /\.ts$/
            },
            {
                test: /\.less$/,
                exclude: '/node_modules/',
                loader: ExtractTextPlugin.extract('style', 'css?sourceMap!less')
            }
        ],
        noParse: [
            path.join('node_modules', 'angular2', 'bundles')
        ]
    },
    resolve: {
        extensions: ['', '.js', '.ts'],
        modulesDirectories: ['node_modules'],
        root: helpers.root('src')
    },
    tslint: {
        emitErrors: true
    }
};