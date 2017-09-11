// Error.stackTraceLimit = Infinity;

// require('core-js/es6');
// require('core-js/es7/reflect');

// // Typescript emit helpers polyfill
// require('ts-helpers');

// require('zone.js/dist/zone');
// require('zone.js/dist/long-stack-trace-zone');
// require('zone.js/dist/jasmine-patch');
// require('zone.js/dist/async-test');
// require('zone.js/dist/fake-async-test');
// require('zone.js/dist/sync-test');

// // RxJS
// require('rxjs/Rx');

// var testing = require('@angular/core/testing');
// var browser = require('@angular/platform-browser-dynamic/testing');

// testing.setBaseTestProviders(
//   browser.TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
//   browser.TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS
// );

// var testContext = require.context('../src', true, /\.ts/);
// function requireAll(requireContext) {
//   return requireContext.keys().map(requireContext);
// }

// // requires and returns all modules that match
// var modules = requireAll(testContext);


Error.stackTraceLimit = Infinity;

require('es6-shim');
require('reflect-metadata');
require('zone.js/dist/zone');
require('zone.js/dist/long-stack-trace-zone');

var browser = require('@angular/platform-browser-dynamic/testing');
var testing = require('@angular/core/testing');
var context = require.context('../src/', true, /\.spec\.ts$/);

jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000;

// testing.setBaseTestProviders(
//     browser.TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
//     browser.TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS
// );

context.keys()
    .forEach(context);