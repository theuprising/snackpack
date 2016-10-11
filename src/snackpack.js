#!/usr/bin/env node

// snackpack!

import commander from 'commander'
import path from 'path'
import { merge, mergeWith, isArray, isFunction } from 'lodash'
import { Console } from 'console'
import { inspect } from 'util'
import { dissoc } from 'ramda'
import webpack from 'webpack'
import defaultManifest from './default-manifest'

const colorize = x => inspect(x, false, 6, true)

const identity = x => x

const passthrough = (stream, formatter) => {
  const c = new Console(stream, stream)
  const f = formatter || identity
  return msg => {
    c.log(f(msg)); return msg
  }
}
const stderr = passthrough(process.stderr, colorize)
const stdout = passthrough(process.stdout, colorize)

const mergeDeep = (...objs) => mergeWith(...objs, (objValue, srcValue) => {
  if (isArray(objValue)) {
    return objValue.concat(srcValue)
  }
})

const handleWebpackErrors = (err, stats) => {
  if (err) { stderr(err); throw new Error(`webpack build error: ${err}`) }
  const statsAsJson = stats.toJson()
  if (statsAsJson.errors.length > 0) { stderr(statsAsJson.errors); throw new Error(`webpack build error: ${statsAsJson.errors}`) }
  if (statsAsJson.warnings.length > 0) stderr(statsAsJson.warnings)
}

const meta = require('../package.json')

const snackpack = ({debugMode, confDir, manifestFile, environments, cmd}) => {
  // logging function
  const debug = debugMode
    ? stderr
    : identity

  debug({confDir, manifestFile, environments, cmd, debugMode})

  // get cwd
  const makeProjectPath = (cwd =>
    (...p) => path.join(cwd, ...p)
  )(process.cwd())

  // get builtIn dir
  const makeSnackpackPath = (...p) => path.join(__dirname, ...p)

  // get manifest
  const manifest = global.__snackpackManifest = (defaults => path => {
    const manifestPath = makeProjectPath(path)
    let manifest
    try {
      manifest = require(manifestPath)
    } catch (e) {
      throw new Error(`Could not load manifest file from ${manifestPath}: ${e}`)
    }
    debug({manifest})
    return merge(defaults, manifest)
  })(defaultManifest)(manifestFile)

  // get builder names
  const builders = environments
    .reduce((builders, environment) => {
      const e = manifest.environments[environment]
      const b = e && e.builders ? e.builders : []
      return b
        ? builders.concat(b)
        : builders
    }, ['webpack'])

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
      stderr(`using config file at ${path}.js`)
    } catch (e) {
      debug(e)
      stderr(`no config file at ${path}.js`)
      out = {}
    }
    return out
  }

  const snackpackConfigFor = debug(getConfig(debug(snackpackConfigPath)))
  const projectConfigFor = debug(getConfig(debug(projectConfigPath)))

  const configFor = (builder, environment) => {
    const builderConfig = snackpackConfigFor(builder, environment)
    const projectConfig = projectConfigFor(builder, environment)
    const out = mergeDeep(builderConfig, projectConfig)
    debug(`config for builder: ${builder}, environment: ${environment}:`)
    debug(out)
    return out
  }

  const applyConfig = (oldConfig, newConfig) => isFunction(newConfig)
    ? newConfig(oldConfig)
    : mergeDeep(oldConfig, newConfig)

  // build config
  const buildConfig = (environments, builders) => {
    const reduction = environments.reduce((lastEnvironmentConfig, environment) => {
      return builders.reduce((lastBuilderConfig, builder) => {
        debug(`builder: ${builder}, environment: ${environment}`)
        const newConfig = configFor(builder, environment)
        const out = applyConfig(lastBuilderConfig, newConfig)
        debug({out})
        return out
      }, lastEnvironmentConfig)
    }, {snackpack: manifest})
    const config = dissoc('snackpack')(reduction)
    debug({config})
    return config
  }

  const config = buildConfig(environments, builders)

  const webpackCallback = (err, stats) => {
    handleWebpackErrors(err, stats)
  // debug({stats})
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

  stdout('done')
  debug(config)

  switch (cmd) {
    case 'config':
      return config
    case 'run':
      return webpackRun(config)
    case 'watch':
      return webpackWatch(config)
    case 'serve':
      // const compiler = webpack(config)
      // const server = new WebpackDevServer(compiler, config.devServer)
      const server = require('./server.js')
      server.start(manifest)(config)
      process.on('exit', server.stop)
      process.on('uncaughtException', server.stop)
      break
    default:
      return new Error('bad command')
  }

  return config
}

// arg parser
const command = commander
  .version(meta.version)
  .usage('<cmd> [options] [environments...]')
  .arguments('<cmd> [environments...]')
  .option('-c, --conf-dir [confDir]', 'Set the configuration directory [snackpack]', 'snackpack')
  .option('-m, --manifest [manifest]', 'Set the manifest file [snackpack.json]', 'snackpack.json')
  .option('-d, --debug-mode', 'Use debug mode')
  .parse(process.argv)

// parse args
const {confDir, manifest, debugMode, args} = command
const [cmd, ..._environments] = args
const environments = ['defaults', ..._environments]

snackpack({environments, confDir, manifestFile: manifest, debugMode, cmd})

export default snackpack
