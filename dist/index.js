/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, __dirname) {// snackpack!

	import commander from 'commander'
	import path from 'path'
	import lodash, { merge }  from 'lodash'
	import webpack from 'webpack'

	const meta = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./package.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))

	const legalTasks = ['run', 'watch']

	const snackpack = ({log, debug, task, confDir, manifestFile, environments, dryRun}) => {
	  debug({task, confDir, manifestFile, environments, dryRun})
	  // validate args
	  if (legalTasks.indexOf(task) < 0) {
	    throw new Error(`${task} is an invalid task. It should be one of: ${legalTasks.join(', ')}`)
	  }

	  // get cwd
	  const _cwd = process.cwd()
	  const makeProjectPath = (...p) => path.join(_cwd, ...p)
	  debug({_cwd})

	  // get builtIn dir
	  const makeSnackpackPath = (...p) => path.join(__dirname, ...p)

	  // get manifest
	  const manifestPath = makeProjectPath(manifestFile)
	  let manifest
	  try {
	    manifest = __webpack_require__(2)(manifestPath).default
	  } catch (e) {
	    throw new Error(`Could not load manifest file from ${manifestPath}: ${e}`)
	  }
	  debug({manifest})

	  // get builder names
	  const builders = ['webpack', ...manifest.builders]
	  debug({builders})

	  // config path getters
	  const snackpackConfigPath = (builder, environment) => makeSnackpackPath('config', builder, environment)
	  const projectConfigPath = (builder, environment) => makeProjectPath(confDir, builder, environment)

	  // config getters
	  const getConfig = pathGetter => (builder, environment) => {
	    const path = pathGetter(builder, environment)
	    let out
	    try {
	      const got = __webpack_require__(2)(path).default
	      out = got
	      log(`using config file at ${path}.js`)
	    } catch (e) {
	      log(`no config file at ${path}.js`)
	      out = {}
	    }
	    return out
	  }

	  const snackpackConfigFor = debug(getConfig(debug(snackpackConfigPath)))
	  const projectConfigFor = debug(getConfig(debug(projectConfigPath)))

	  const configFor = (builder, environment) => {
	    const builderConfig = snackpackConfigFor(builder, environment)
	    const projectConfig = projectConfigFor(builder, environment)
	    const out = merge(builderConfig, projectConfig)
	    debug(`config for builder: ${builder}, environment: ${environment}:`)
	    debug(out)
	    return out
	  }

	  debug('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')

	  // build config
	  const buildConfig = (environments, builders) => {
	    const config = environments.reduce((lastEnvironmentConfig, environment) => {
	      return builders.reduce((lastBuilderConfig, builder) => {
	        debug(`builder: ${builder}, environment: ${environment}`)
	        const newConfig = configFor(builder, environment)
	        debug({lastBuilderConfig, newConfig})
	        const out = merge(lastBuilderConfig, newConfig)
	        debug({out})
	        return out
	      }, lastEnvironmentConfig)
	    }, {})
	    debug({config})
	    return config
	  }

	  const webpackCallback = (err, stats) => {
	    if (err) throw new Error(`error running webpack: ${err}`)
	    const jsonStats = stats.toJson()
	    if (jsonStats.errors.length > 0) throw new Error(`error running webpack: ${JSON.stringify(jsonStats.errors)}`)
	    if (jsonStats.warnings.length > 0) throw new Error(`webpack warning: ${JSON.stringify(jsonStats.warning)}`)
	    debug({stats})
	  }

	  const webpackRun = config => {
	    const compiler = webpack(config)
	    return compiler.run(webpackCallback)
	  }

	  const webpackWatch = config => {
	    const compiler = webpack(config)
	    return compiler.watch({
	      aggregateTimeout: 300,
	      poll: true
	    }, webpackCallback)
	  }

	  const webpackDo = verb => {
	    if (verb === 'run') return webpackRun
	    if (verb === 'watch') return webpackWatch
	    throw new Error(`I don't know how to make webpack ${verb}, only 'run', and 'watch'.`)
	  }

	  const config = buildConfig(environments, builders)
	  if (dryRun) {
	    console.log('exports.default =', config)
	  }

	  ;(task => {
	    switch (task) {
	      case 'run':
	        return webpackDo(task)(config)
	      case 'watch':
	        return webpackDo(task)(config)
	      default: return false
	    }
	  })(task)

	  const keepWatch = () => { if (task === 'watch') { log('still watching'); setTimeout(keepWatch, 5000) } }
	  keepWatch()
	}

	// arg parser
	commander
	  .version(meta.version)
	  .usage('[options] [environments...]')
	  .arguments('[environments...]')
	  .option('-c, --conf-dir [confDir]', 'Set the configuration directory [config]', 'config')
	  .option('-m, --manifest [manifest]', 'Set the manifest file [snackpack.js]', 'snackpack.js')
	  .option('-n, --dry-run', `Just output the config, don't actually do anything with it`)
	  .option('-t, --task [task]', `Set the task (either: ${legalTasks.join(', ')}) [run]`, 'run')
	  .option('-s, --silent', `Don't log anything. If you use silent with dry-run, you can pipe the output to a webpack.config file`)
	  .option('-d, --debug-mode', 'Use debug mode')
	  .action((_environments, command) => {
	    // parse args
	    const {confDir, manifest, task, dryRun, debugMode, silent} = command
	    const environments = ['defaults', ..._environments]

	    // logging
	    const log = val => { if (!silent) { console.log(val) }; return val }
	    const debug = val => {
	      if (debugMode && !silent) {
	        log('')
	        log(val)
	      }
	      return val
	    }

	    snackpack({task, environments, confDir, manifestFile: manifest, dryRun, log, debug})
	  })
	  .parse(process.argv)


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1), "/"))

/***/ },
/* 1 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./snackpack": 3,
		"./snackpack.js": 3
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 2;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, __dirname) {// snackpack!

	import commander from 'commander'
	import path from 'path'
	import lodash, { merge }  from 'lodash'
	import webpack from 'webpack'

	const meta = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./package.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()))

	const legalTasks = ['run', 'watch']

	const snackpack = ({log, debug, task, confDir, manifestFile, environments, dryRun}) => {
	  debug({task, confDir, manifestFile, environments, dryRun})
	  // validate args
	  if (legalTasks.indexOf(task) < 0) {
	    throw new Error(`${task} is an invalid task. It should be one of: ${legalTasks.join(', ')}`)
	  }

	  // get cwd
	  const _cwd = process.cwd()
	  const makeProjectPath = (...p) => path.join(_cwd, ...p)
	  debug({_cwd})

	  // get builtIn dir
	  const makeSnackpackPath = (...p) => path.join(__dirname, ...p)

	  // get manifest
	  const manifestPath = makeProjectPath(manifestFile)
	  let manifest
	  try {
	    manifest = __webpack_require__(2)(manifestPath).default
	  } catch (e) {
	    throw new Error(`Could not load manifest file from ${manifestPath}: ${e}`)
	  }
	  debug({manifest})

	  // get builder names
	  const builders = ['webpack', ...manifest.builders]
	  debug({builders})

	  // config path getters
	  const snackpackConfigPath = (builder, environment) => makeSnackpackPath('config', builder, environment)
	  const projectConfigPath = (builder, environment) => makeProjectPath(confDir, builder, environment)

	  // config getters
	  const getConfig = pathGetter => (builder, environment) => {
	    const path = pathGetter(builder, environment)
	    let out
	    try {
	      const got = __webpack_require__(2)(path).default
	      out = got
	      log(`using config file at ${path}.js`)
	    } catch (e) {
	      log(`no config file at ${path}.js`)
	      out = {}
	    }
	    return out
	  }

	  const snackpackConfigFor = debug(getConfig(debug(snackpackConfigPath)))
	  const projectConfigFor = debug(getConfig(debug(projectConfigPath)))

	  const configFor = (builder, environment) => {
	    const builderConfig = snackpackConfigFor(builder, environment)
	    const projectConfig = projectConfigFor(builder, environment)
	    const out = merge(builderConfig, projectConfig)
	    debug(`config for builder: ${builder}, environment: ${environment}:`)
	    debug(out)
	    return out
	  }

	  debug('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')

	  // build config
	  const buildConfig = (environments, builders) => {
	    const config = environments.reduce((lastEnvironmentConfig, environment) => {
	      return builders.reduce((lastBuilderConfig, builder) => {
	        debug(`builder: ${builder}, environment: ${environment}`)
	        const newConfig = configFor(builder, environment)
	        debug({lastBuilderConfig, newConfig})
	        const out = merge(lastBuilderConfig, newConfig)
	        debug({out})
	        return out
	      }, lastEnvironmentConfig)
	    }, {})
	    debug({config})
	    return config
	  }

	  const webpackCallback = (err, stats) => {
	    if (err) throw new Error(`error running webpack: ${err}`)
	    const jsonStats = stats.toJson()
	    if (jsonStats.errors.length > 0) throw new Error(`error running webpack: ${JSON.stringify(jsonStats.errors)}`)
	    if (jsonStats.warnings.length > 0) throw new Error(`webpack warning: ${JSON.stringify(jsonStats.warning)}`)
	    debug({stats})
	  }

	  const webpackRun = config => {
	    const compiler = webpack(config)
	    return compiler.run(webpackCallback)
	  }

	  const webpackWatch = config => {
	    const compiler = webpack(config)
	    return compiler.watch({
	      aggregateTimeout: 300,
	      poll: true
	    }, webpackCallback)
	  }

	  const webpackDo = verb => {
	    if (verb === 'run') return webpackRun
	    if (verb === 'watch') return webpackWatch
	    throw new Error(`I don't know how to make webpack ${verb}, only 'run', and 'watch'.`)
	  }

	  const config = buildConfig(environments, builders)
	  if (dryRun) {
	    console.log('exports.default =', config)
	  }

	  ;(task => {
	    switch (task) {
	      case 'run':
	        return webpackDo(task)(config)
	      case 'watch':
	        return webpackDo(task)(config)
	      default: return false
	    }
	  })(task)

	  const keepWatch = () => { if (task === 'watch') { log('still watching'); setTimeout(keepWatch, 5000) } }
	  keepWatch()
	}

	// arg parser
	commander
	  .version(meta.version)
	  .usage('[options] [environments...]')
	  .arguments('[environments...]')
	  .option('-c, --conf-dir [confDir]', 'Set the configuration directory [config]', 'config')
	  .option('-m, --manifest [manifest]', 'Set the manifest file [snackpack.js]', 'snackpack.js')
	  .option('-n, --dry-run', `Just output the config, don't actually do anything with it`)
	  .option('-t, --task [task]', `Set the task (either: ${legalTasks.join(', ')}) [run]`, 'run')
	  .option('-s, --silent', `Don't log anything. If you use silent with dry-run, you can pipe the output to a webpack.config file`)
	  .option('-d, --debug-mode', 'Use debug mode')
	  .action((_environments, command) => {
	    // parse args
	    const {confDir, manifest, task, dryRun, debugMode, silent} = command
	    const environments = ['defaults', ..._environments]

	    // logging
	    const log = val => { if (!silent) { console.log(val) }; return val }
	    const debug = val => {
	      if (debugMode && !silent) {
	        log('')
	        log(val)
	      }
	      return val
	    }

	    snackpack({task, environments, confDir, manifestFile: manifest, dryRun, log, debug})
	  })
	  .parse(process.argv)


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1), "/"))

/***/ }
/******/ ]);