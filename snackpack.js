#!/usr/bin/env node
'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } // snackpack!

var meta = require('./package.json');

var legalTasks = ['run', 'watch'];

var snackpack = function snackpack(_ref) {
  var log = _ref.log;
  var debug = _ref.debug;
  var task = _ref.task;
  var confDir = _ref.confDir;
  var manifestFile = _ref.manifestFile;
  var environments = _ref.environments;
  var dryRun = _ref.dryRun;

  debug({ task: task, confDir: confDir, manifestFile: manifestFile, environments: environments, dryRun: dryRun });
  // validate args
  if (legalTasks.indexOf(task) < 0) {
    throw new Error(task + ' is an invalid task. It should be one of: ' + legalTasks.join(', '));
  }

  // get cwd
  var _cwd = process.cwd();
  var makeProjectPath = function makeProjectPath() {
    for (var _len = arguments.length, p = Array(_len), _key = 0; _key < _len; _key++) {
      p[_key] = arguments[_key];
    }

    return _path2.default.join.apply(_path2.default, [_cwd].concat(p));
  };
  debug({ _cwd: _cwd });

  // get builtIn dir
  var makeSnackpackPath = function makeSnackpackPath() {
    for (var _len2 = arguments.length, p = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      p[_key2] = arguments[_key2];
    }

    return _path2.default.join.apply(_path2.default, [__dirname].concat(p));
  };

  // get manifest
  var manifestPath = makeProjectPath(manifestFile);
  var manifest = void 0;
  try {
    manifest = require(manifestPath).default;
  } catch (e) {
    throw new Error('Could not load manifest file from ' + manifestPath + ': ' + e);
  }
  debug({ manifest: manifest });

  // get builder names
  var builders = ['webpack'].concat(_toConsumableArray(manifest.builders));
  debug({ builders: builders });

  // config path getters
  var snackpackConfigPath = function snackpackConfigPath(builder, environment) {
    return makeSnackpackPath('config', builder, environment);
  };
  var projectConfigPath = function projectConfigPath(builder, environment) {
    return makeProjectPath(confDir, builder, environment);
  };

  // config getters
  var getConfig = function getConfig(pathGetter) {
    return function (builder, environment) {
      var path = pathGetter(builder, environment);
      var out = void 0;
      try {
        var got = require(path).default;
        out = got;
        log('using config file at ' + path + '.js');
      } catch (e) {
        log('no config file at ' + path + '.js');
        out = {};
      }
      return out;
    };
  };

  var snackpackConfigFor = debug(getConfig(debug(snackpackConfigPath)));
  var projectConfigFor = debug(getConfig(debug(projectConfigPath)));

  var configFor = function configFor(builder, environment) {
    var builderConfig = snackpackConfigFor(builder, environment);
    var projectConfig = projectConfigFor(builder, environment);
    var out = (0, _lodash.merge)(builderConfig, projectConfig);
    debug('config for builder: ' + builder + ', environment: ' + environment + ':');
    debug(out);
    return out;
  };

  debug('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

  // build config
  var buildConfig = function buildConfig(environments, builders) {
    var config = environments.reduce(function (lastEnvironmentConfig, environment) {
      return builders.reduce(function (lastBuilderConfig, builder) {
        debug('builder: ' + builder + ', environment: ' + environment);
        var newConfig = configFor(builder, environment);
        debug({ lastBuilderConfig: lastBuilderConfig, newConfig: newConfig });
        var out = (0, _lodash.merge)(lastBuilderConfig, newConfig);
        debug({ out: out });
        return out;
      }, lastEnvironmentConfig);
    }, {});
    debug({ config: config });
    return config;
  };

  var webpackCallback = function webpackCallback(err, stats) {
    if (err) throw new Error('error running webpack: ' + err);
    var jsonStats = stats.toJson();
    if (jsonStats.errors.length > 0) throw new Error('error running webpack: ' + JSON.stringify(jsonStats.errors));
    if (jsonStats.warnings.length > 0) throw new Error('webpack warning: ' + JSON.stringify(jsonStats.warning));
    debug({ stats: stats });
  };

  var webpackRun = function webpackRun(config) {
    var compiler = (0, _webpack2.default)(config);
    return compiler.run(webpackCallback);
  };

  var webpackWatch = function webpackWatch(config) {
    var compiler = (0, _webpack2.default)(config);
    return compiler.watch({
      aggregateTimeout: 300,
      poll: true
    }, webpackCallback);
  };

  var webpackDo = function webpackDo(verb) {
    if (verb === 'run') return webpackRun;
    if (verb === 'watch') return webpackWatch;
    throw new Error('I don\'t know how to make webpack ' + verb + ', only \'run\', and \'watch\'.');
  };

  var config = buildConfig(environments, builders);
  if (dryRun) {
    console.log('exports.default =', config);
  }

  ;(function (task) {
    switch (task) {
      case 'run':
        return webpackDo(task)(config);
      case 'watch':
        return webpackDo(task)(config);
      default:
        return false;
    }
  })(task);

  var keepWatch = function keepWatch() {
    if (task === 'watch') {
      log('still watching');setTimeout(keepWatch, 5000);
    }
  };
  keepWatch();
};

// arg parser
_commander2.default.version(meta.version).usage('[options] [environments...]').arguments('[environments...]').option('-c, --conf-dir [confDir]', 'Set the configuration directory [config]', 'config').option('-m, --manifest [manifest]', 'Set the manifest file [snackpack.js]', 'snackpack.js').option('-n, --dry-run', 'Just output the config, don\'t actually do anything with it').option('-t, --task [task]', 'Set the task (either: ' + legalTasks.join(', ') + ') [run]', 'run').option('-s, --silent', 'Don\'t log anything. If you use silent with dry-run, you can pipe the output to a webpack.config file').option('-d, --debug-mode', 'Use debug mode').action(function (_environments, command) {
  // parse args
  var confDir = command.confDir;
  var manifest = command.manifest;
  var task = command.task;
  var dryRun = command.dryRun;
  var debugMode = command.debugMode;
  var silent = command.silent;

  var environments = ['defaults'].concat(_toConsumableArray(_environments));

  // logging
  var log = function log(val) {
    if (!silent) {
      console.log(val);
    };return val;
  };
  var debug = function debug(val) {
    if (debugMode && !silent) {
      log('');
      log(val);
    }
    return val;
  };

  snackpack({ task: task, environments: environments, confDir: confDir, manifestFile: manifest, dryRun: dryRun, log: log, debug: debug });
}).parse(process.argv);

