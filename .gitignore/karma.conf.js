
module.exports = function(config) {
  var configuration = {
    // Test frameworks to use    
    frameworks: ['jasmine'],
    // Files to load in the browser    
    files: [ { pattern: './config/spec-bundle.js', watched: false } ],
    logLevel: config.LOG_INFO,
    phantomJsLauncher: {
        exitOnResourceError: true
    },
    port: 9876,
    preprocessors: {
        './config/spec-bundle.js': ['webpack', 'sourcemap']
    },
    // test result reporter    
    reporters: ['progress'],
    webpack: require('./config/webpack.test.js'),
    webpackServer: {
        noInfo: true
    },
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,
    // start these browsers
    browsers: ['Chrome'],    
    singleRun: true    
  };

  config.set(configuration);
}

// module.exports = function(config) {
//   var testWebpackConfig = require('./config/webpack.test.js');
//   var configuration = {
//     // base path that will be used to resolve all patterns (e.g. files, exclude)
//     basePath: '.',
//     //Test Frameworks to use
//     frameworks: ['jasmine'],
//     // list of files to exclude
//     exclude: [ ],
//     //list of files / patterns to load in the browser
//     files: [ { pattern: './config/spec-bundle.js', watched: false } ],
//     //files: [ { pattern: './src/**/*.spec.ts', watched: false } ],    
//     //preprocess matching files before serving them to the browser
//     preprocessors: { './config/spec-bundle.js': ['webpack', 'sourcemap'] },
//     //preprocessors: { './src/**/*.spec.ts': ['webpack'] },    
//     // Webpack Config at ./webpack.test.js
//     webpack: testWebpackConfig,
//     // Webpack please don't spam the console when running in karma!
//     webpackServer: { noInfo: true },
//     // Test results reporter to use
//     reporters: ['progress'],
//     // web server port
//     port: 9876,
//     // enable / disable colors in the output (reporters and logs)
//     colors: true,
//     // Level of logging
//     logLevel: config.LOG_INFO,
//     // Enable / Disable watching file and executing tests whenever any file changes
//     autoWatch: false,
//     browsers: [
//       'Chrome'
//     ],
//     customLaunchers: {
//       Chrome_travis_ci: {
//         base: 'Chrome',
//         flags: ['--no-sandbox']
//       }
//     },

//     /*
//      * Continuous Integration mode
//      * if true, Karma captures browsers, runs the tests and exits
//      */
//     singleRun: true
//   };

//   config.set(configuration);
// };


