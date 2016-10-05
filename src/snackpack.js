// snackpack!

import commander from 'commander'
import path from 'path'
import { merge } from 'lodash'
import webpack from 'webpack'

const meta = require('./package.json')

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
    manifest = require(manifestPath).default
  } catch (e) {
    throw new Error(`Could not load manifest file from ${manifestPath}: ${e}`)
  }
  debug({manifest})

  // get builder names
  const builders = environments
  .reduce((builders, environment) => {
    const b = manifest[environment]
    return b
      ? builders.concat(b)
      : builders
  })

  debug({builders})

  // config path getters
  const snackpackConfigPath = (builder, environment) => makeSnackpackPath('config', builder, environment)
  const projectConfigPath = (builder, environment) => makeProjectPath(confDir, builder, environment)

  // config getters
  const getConfig = pathGetter => (builder, environment) => {
    const path = pathGetter(builder, environment)
    let out
    try {
      const got = require(path).default
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

