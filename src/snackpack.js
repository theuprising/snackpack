// snackpack!

import commander from 'commander'
import path from 'path'
import merge from 'lodash'
import webpack from 'webpack'

// arg parser
const cli = commander
  .version('0.0.1')
  .option('-c, --conf-dir [projectcConfDir]', 'Set the configuration directory [./config/]', './config')
  .option('-m, --manifest [manifestFile]', 'Set the manifest file [./snackpack.js]', './snackpack.js')
  .option('-t, --task [task]', "Set the task (either 'watch', 'run', or 'config') [run]", 'run')
  .option('-d, --debug', 'Use debug mode', false)

// logging
const log = val => { console.log(val); return val }
const debug = val => command.debug ? log(val) : val

// parse args
const command = cli.parse(process.argv)
const {task, confDir, manifestFile} = command
const environments = ['defaults', ...command.args]
debug({command, task, environments, confDir, manifestFile})

// validate args
const legalTasks = ['run', 'watch', 'config']
if (legalTasks.indexOf(task) < 0) {
  throw new Error(`${task} is an invalid task. It should be one of: ${legalTasks.join(', ')}`)
}

// get cwd
const _cwd = process.cwd()
const makeProjectPath = (...p) => path.join(_cwd, ...p)
debug({_cwd})

// get builtIn dir
const makeSnackpackPath = (...p) => path.join('.', ...p)

// get manifest
const manifestPath = makeProjectPath(command.manifest)
let manifest
try {
  manifest = require(manifestPath).default
} catch (e) {
  throw new Error(`Could not load manifest file from ${manifestPath}: ${e}`)
}
debug({manifest})

// get builder names
const builders = ['webpack', ...manifest.builders]
debug({builders})

// config path getters
const snackpackConfigPath = (builder, environment) => makeSnackpackPath('config', builder, environment)
const projectConfigPath = (builder, environment) => makeProjectPath('config', builder, environment)

// config getters
const getConfig = pathGetter => (builder, environment) => {
  const path = pathGetter(builder, environment)
  let out
  try {
    const got = require(path)
    out = got.default
  } catch (e) {
    log(`no config specified for ${path}`)
    out = {}
  }
  return out
}

const snackpackConfigFor = getConfig(snackpackConfigPath)
const projectConfigFor = getConfig(projectConfigPath)

const configFor = (builder, environment) => {
  const builderConfig = snackpackConfigFor(builder, environment)
  const projectConfig = projectConfigFor(builder, environment)
  const out = merge(builderConfig, projectConfig).value()
  debug(`config for builder: ${builder}, environment: ${environment}`, {builderConfig, projectConfig, out})
  return out
}

debug('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')

// build config
const buildConfig = (environments, builders) => {
  const config = environments.reduce((lastConfig, environment) => {
    debug('doing environment', environment)
    return builders.reduce((lastConfig, builder) => {
      debug(`builder: ${builder}, environment: ${environment}`)
      const newConfig = configFor(builder, environment)
      debug({lastConfig, newConfig})
      return merge(lastConfig, newConfig).value()
    }, lastConfig)
  }, {})
  debug({config})
  return config
}

const webpackCallback = (err, stats) => {
  if (err) throw new Error(`error running webpack: ${err}`)
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

let watcher
;(task => {
  const config = buildConfig(environments, builders)
  switch (task) {
    case 'config': return config
    case 'run':
      return webpackDo(task)(config)
    case 'watch':
      const w = webpackDo(task)(config)
      watcher = w
      return w
    default: return false
  }
})(task)

const keepWatch = () => { if (watcher) { debug('still watching'); setTimeout(keepWatch, 1000) } }
keepWatch()

