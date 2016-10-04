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

// arg parser
var cli = _commander2.default.version('0.0.1').option('-c, --conf-dir [projectcConfDir]', 'Set the configuration directory [./config/]', './config').option('-m, --manifest [manifestFile]', 'Set the manifest file [./snackpack.js]', './snackpack.js').option('-t, --task [task]', "Set the task (either 'watch', 'run', or 'config') [run]", 'run').option('-d, --debug', 'Use debug mode', false);

// logging
var log = function log(val) {
  console.log(val);return val;
};
var debug = function debug(val) {
  return command.debug ? log(val) : val;
};

// parse args
var command = cli.parse(process.argv);
var task = command.task;
var confDir = command.confDir;
var manifestFile = command.manifestFile;

var environments = ['defaults'].concat(_toConsumableArray(command.args));
debug({ command: command, task: task, environments: environments, confDir: confDir, manifestFile: manifestFile });

// validate args
var legalTasks = ['run', 'watch', 'config'];
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

  return _path2.default.join.apply(_path2.default, ['.'].concat(p));
};

// get manifest
var manifestPath = makeProjectPath(command.manifest);
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
  return makeProjectPath('config', builder, environment);
};

// config getters
var getConfig = function getConfig(pathGetter) {
  return function (builder, environment) {
    var path = pathGetter(builder, environment);
    var out = void 0;
    try {
      var got = require(path);
      out = got.default;
    } catch (e) {
      log('no config specified for ' + path);
      out = {};
    }
    return out;
  };
};

var snackpackConfigFor = getConfig(snackpackConfigPath);
var projectConfigFor = getConfig(projectConfigPath);

var configFor = function configFor(builder, environment) {
  var builderConfig = snackpackConfigFor(builder, environment);
  var projectConfig = projectConfigFor(builder, environment);
  var out = (0, _lodash2.default)(builderConfig, projectConfig).value();
  debug('config for builder: ' + builder + ', environment: ' + environment, { builderConfig: builderConfig, projectConfig: projectConfig, out: out });
  return out;
};

debug('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

// build config
var buildConfig = function buildConfig(environments, builders) {
  var config = environments.reduce(function (lastConfig, environment) {
    debug('doing environment', environment);
    return builders.reduce(function (lastConfig, builder) {
      debug('builder: ' + builder + ', environment: ' + environment);
      var newConfig = configFor(builder, environment);
      debug({ lastConfig: lastConfig, newConfig: newConfig });
      return (0, _lodash2.default)(lastConfig, newConfig).value();
    }, lastConfig);
  }, {});
  debug({ config: config });
  return config;
};

var webpackCallback = function webpackCallback(err, stats) {
  if (err) throw new Error('error running webpack: ' + err);
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

var watcher = void 0;(function (task) {
  var config = buildConfig(environments, builders);
  switch (task) {
    case 'config':
      return config;
    case 'run':
      return webpackDo(task)(config);
    case 'watch':
      var w = webpackDo(task)(config);
      watcher = w;
      return w;
    default:
      return false;
  }
})(task);

var keepWatch = function keepWatch() {
  if (watcher) {
    debug('still watching');setTimeout(keepWatch, 1000);
  }
};
keepWatch();

