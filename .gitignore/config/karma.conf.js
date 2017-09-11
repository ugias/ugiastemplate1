module.exports = function(config) {
  var testWebpackConfig = require('./webpack.test.js');
  var configuration = {
    // base path that will be used to resolve all patterns (e.g. files, exclude)
    basePath: '',
    //Test Frameworks to use
    frameworks: ['jasmine'],
    // list of files to exclude
    exclude: [ ],
    //list of files / patterns to load in the browser
    files: [ { pattern: './config/spec-bundle.js', watched: false } ],
    //preprocess matching files before serving them to the browser
    preprocessors: { './config/spec-bundle.js': ['coverage', 'webpack', 'sourcemap'] },
    // Webpack Config at ./webpack.test.js
    webpack: testWebpackConfig,
    coverageReporter: {
      dir : 'coverage/',
      reporters: [
        { type: 'text-summary' },
        { type: 'json' },
        { type: 'html' }
      ]
    },
    // Webpack please don't spam the console when running in karma!
    webpackServer: { noInfo: true },
    // Test results reporter to use
    reporters: [ 'mocha', 'coverage' ],
    // web server port
    port: 9876,
    // enable / disable colors in the output (reporters and logs)
    colors: true,
    // Level of logging
    logLevel: config.LOG_INFO,
    // Enable / Disable watching file and executing tests whenever any file changes
    autoWatch: false,
    browsers: [
      'Chrome'
    ],
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },

    /*
     * Continuous Integration mode
     * if true, Karma captures browsers, runs the tests and exits
     */
    singleRun: true
  };

  if(process.env.TRAVIS){
    configuration.browsers = ['Chrome_travis_ci'];
  }

  config.set(configuration);
};
