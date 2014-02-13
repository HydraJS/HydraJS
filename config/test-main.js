var tests = [];
for (var file in window.__karma__.files) {
  if (/Spec\.js$/.test(file)) {
    tests.push(file);
  }
}
requirejs.config({
  // Karma serves files from '/base'
  baseUrl: '/base/src',

  paths: {
    'hydrajs-testing-helper': '../node_modules/hydrajs-testing-helper/src/hydrajs-testing-helper.js',
    'sinonjs-hydrajs-testing-helper': '../node_modules/sinonjs-hydrajs-testing-helper/src/sinonjs-hydrajs-testing-helper.js',
    'sinon': '../node_modules/sinon/pkg/sinon.js',
    'single': '../test/resources/single.js',
    'extended': '../test/resources/extended.js'
  },
  shim : {
    sinon : { //This is important - otherwise the plugin won't find sinon!
      exports : "sinon"
    }
  },
  // ask Require.js to load these files (all our tests)
  deps: tests,

  // start test run, once Require.js is done
  callback: window.__karma__.start
});