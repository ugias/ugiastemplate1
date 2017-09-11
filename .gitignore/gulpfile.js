'use strict';

var buildConfig = require('./gulp.config')();
var gulp = require('gulp');
var runSeq = require('run-sequence');
var taskListing = require('gulp-task-listing');
var del = require('del');
var glob = require('glob');
var path = require('path');
var args = require('yargs').argv;
var exec = require('child_process').exec;
var browserSync = require('browser-sync');
var tslintStylish = require('tslint-stylish');
var inject = require('gulp-inject');
var $ = require('gulp-load-plugins')({ lazy: true });
var webpack = require('webpack-stream');

gulp.task('build:qa', function (done) {
    runSeq(
        'clean-temp-folder',
        'compile-with-webpack-qa',
        'copy-root-files-to-temp-folder',
        'inject-in-html',
        'clean-dist-folder',
        'copy-to-dist',
        done);
});

gulp.task('build:prod', function (done) {
    runSeq(
        'clean-temp-folder',
        'compile-with-webpack',
        'copy-root-files-to-temp-folder',
        'inject-in-html',
        'clean-dist-folder',
        'copy-to-dist',
        done);
});

gulp.task('clean-temp-folder', function (done) {
    del(buildConfig.temp, { force: true }).then(function () {
        done();
    });
});

gulp.task('clean-dist-folder', function (done) {
    del(buildConfig.targets.buildOutputPath, { force: true }).then(function () {
        done();
    });
});

gulp.task('compile-with-webpack', function () {
    return gulp.src(buildConfig.appEntryPoint)
        .pipe(webpack(require(buildConfig.webpackConfig)))
        .pipe(gulp.dest(buildConfig.temp));
});

gulp.task('compile-with-webpack-qa', function () {
    return gulp.src(buildConfig.appEntryPoint)
        .pipe(webpack(require(buildConfig.webpackConfigQa)))
        .pipe(gulp.dest(buildConfig.temp));
});

gulp.task('copy-index-to-temp-folder', function (done) {
    return gulp.src(buildConfig.general.indexHtml)
        .pipe(gulp.dest(buildConfig.temp));
});

gulp.task('copy-root-files-to-temp-folder', function (done) {
    return gulp.src(buildConfig.general.roortFiles)
        .pipe(gulp.dest(buildConfig.temp));
});

gulp.task('inject-in-html', function (done) {
    var target = gulp.src(
        path.join(buildConfig.temp, "index.html"));

    var sourcesToInject = [];
    sourcesToInject.push(
        path.join(buildConfig.temp, "polyfills.bundle.js"),
        path.join(buildConfig.temp, "vendor.bundle.js"),
        path.join(buildConfig.temp, "app.bundle.js")
    );
    sourcesToInject.push(
        path.join(buildConfig.temp, "vendor.bundle.css"),
        path.join(buildConfig.temp, "app.bundle.css")
    );

    var sources = gulp.src(sourcesToInject, {
        read: false
    });

    return target.pipe(inject(sources, {
        //ignorePath: buildConfig.temp,
        relative: true,
        addRootSlash: false
    })).pipe(gulp.dest(buildConfig.temp));
});


gulp.task('copy-to-dist', function () {
    var sourcePath = path.join(buildConfig.temp, "**", '*.*');
    return gulp.src([sourcePath])
        .pipe(gulp.dest(buildConfig.targets.buildOutputPath));
});

// /**
//  * yargs variables can be passed in to alter the behavior, when present.
//  * Example: gulp typescript-compile
//  *
//  * --verbose  : Various tasks will produce more output to the console.
//  */

// /**
//  * List the available gulp tasks
//  */
// gulp.task('help', $.taskListing.withFilters(/:/));
// gulp.task('default', ['help']);

// /**
//  * Vet both ES5 and TypeScript
//  * @return {Stream}
//  */
// gulp.task('scripts-vet', ['vet:es5', 'vet:typescript'], function () {
// });

// /**
//  * Compile TypeScript
//  */
// gulp.task('typescript-compile', ['vet:typescript', 'clean:generated'], function () {

//     log('Compiling TypeScript');
//     exec('node_modules/typescript/bin/tsc -p src');
// });

// /**
//  * Watch and compile TypeScript
//  */
// gulp.task('typescript-watch', ['typescript-compile'], function () {

//     return gulp.watch(buildConfig.ts.files, ['typescript-compile']);
// });

// /**
//  * Run specs once and exit
//  * @return {Stream}
//  */
// gulp.task('tests-run', ['typescript-compile'], function () {

//     startTests(true /*singleRun*/);
// });

// /**
//  * Run specs and wait.
//  * Watch for file changes and re-run tests on each change
//  */
// gulp.task('tests-watch', ['typescript-watch'], function () {

//     startTests(false /*singleRun*/);
// });

// /**
//  * Run the spec runner
//  * @return {Stream}
//  */
// gulp.task('tests-serve', ['specs:inject', 'imports:inject','typescript-watch'], function () {

//     log('Running the spec runner');

//     serveSpecRunner();
// });

// /**
//  * vet es5 code
//  * --verbose
//  * @return {Stream}
//  */
// gulp.task('vet:es5', function() {

//     log('Analyzing ES5 code with JSHint');

//     return gulp
//         .src(buildConfig.js.root)
//         .pipe($.if(args.verbose, $.print()))
//         .pipe($.jshint())
//         .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
//         .pipe($.jshint.reporter('fail'));
// });

// /**
//  * vet typescript code
//  * @return {Stream}
//  */
// gulp.task('vet:typescript', function () {

//     log('Analyzing typescript code with TSLint');

//     return gulp
//         .src(buildConfig.ts.files)
//         .pipe($.tslint())
//         .pipe($.tslint.report(tslintStylish, {
//             emitError: false,
//             sort: true,
//             bell: false
//         }));
// });

// /**
//  * Remove generated files
//  * @return {Stream}
//  */
// gulp.task('clean:generated', function () {

//     log('Cleaning generated files: ' + $.util.colors.blue(buildConfig.ts.out));
//     return del(buildConfig.ts.out);
// });

// /**
//  * Inject all the spec files into the SpecRunner.html
//  * @return {Stream}
//  */
// gulp.task('specs:inject', function () {

//     log('Injecting scripts into the spec runner');

//     return gulp
//         .src(buildConfig.specRunner)
//         .pipe(inject(buildConfig.js.src, '', buildConfig.js.order))
//         .pipe(inject(buildConfig.js.specs, 'specs', ['**/*']))
//         .pipe(gulp.dest(buildConfig.root));
// });

// /**
//  * Inject imports into system.js
//  * @return {Stream}
//  */
// gulp.task('imports:inject', function(){

//     log('Injecting imports into system.js');

//     gulp.src(buildConfig.imports.template)
//         .pipe(injectString(buildConfig.js.specs, 'import'))
//         .pipe($.rename(buildConfig.imports.script))
//         .pipe(gulp.dest(buildConfig.root));
// });

// ////////////////

// /**
//  * Log a message or series of messages using chalk's blue color.
//  * Can pass in a string, object or array.
//  */
// function log(msg) {

//     if (typeof (msg) === 'object') {
//         for (var item in msg) {
//             if (msg.hasOwnProperty(item)) {
//                 $.util.log($.util.colors.blue(msg[item]));
//             }
//         }
//     } else {
//         $.util.log($.util.colors.blue(msg));
//     }
// }

// /**
//  * Start the tests using karma.
//  * @param  {boolean} singleRun - True means run once and end (CI), or keep running (dev)
//  * @return {undefined}
//  */
// function startTests(singleRun) {

//     var Server = require('karma').Server;

//     log('Karma started');

//     var server = new Server({
//         buildConfigFile: __dirname + '/karma.conf.js',
//         exclude: buildConfig.karma.exclude,
//         singleRun: !!singleRun
//     });

//     server.on('run_complete', function (browser, result) {
//         log('Karma completed');
//     });

//     server.start();
// }

// /**
//  * Order a stream
//  * @param   {Stream} src   The gulp.src stream
//  * @param   {Array} order Glob array pattern
//  * @returns {Stream} The ordered stream
//  */
// function orderSrc(src, order) {

//     return gulp
//         .src(src)
//         .pipe($.if(order, $.order(order)));
// }

// /**
//  * Inject files in a sorted sequence at a specified inject label
//  * @param   {Array} src   glob pattern for source files
//  * @param   {String} label   The label name
//  * @param   {Array} order   glob pattern for sort order of the files
//  * @returns {Stream}   The stream
//  */
// function inject(src, label, order) {

//     var options = { read: false, addRootSlash: false };
//     if (label) {
//         options.name = 'inject:' + label;
//     }
//     return $.inject(orderSrc(src, order), options);
// }

// /**
//  * Inject files as strings at a specified inject label
//  * @param   {Array} src   glob pattern for source files
//  * @param   {String} label   The label name
//  * @returns {Stream}   The stream
//  */
// function injectString(src, label) {

//     var search = '/// inject:' + label;
//     var first = '\n    System.import(\'';
//     var last = '\')';
//     var specNames = [];

//     src.forEach(function(pattern) {
//         glob.sync(pattern)
//             .forEach(function(file) {
//                 var fileName = path.basename(file, path.extname(file));
//                 var specName = path.join(path.dirname(file), fileName);
//                 specNames.push(first + specName + last);
//             });
//     });

//     return $.injectString.after(search, specNames);
// }

// /**
//  * Start BrowserSync
//  * --verbose
//  */
// function serveSpecRunner() {

//     if (browserSync.active) {
//         return;
//     }

//     log('Starting BrowserSync on port ' + buildConfig.browserSyncPort);

//     var options = {
//         port: buildConfig.browserSync.port,
//         server: buildConfig.root,
//         files: buildConfig.js.srcSpecs,
//         logFileChanges: true,
//         logLevel: buildConfig.browserSync.logLevel,
//         logPrefix: buildConfig.browserSync.logPrefix,
//         notify: true,
//         reloadDelay: buildConfig.browserSync.reloadDelay,
//         startPath: buildConfig.specRunnerFile
//     };

//     if (args.verbose) {
//         options.logLevel = 'debug';
//     }

//     browserSync(options);
// }






