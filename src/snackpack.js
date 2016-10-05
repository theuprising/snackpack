#!/usr/bin/env node

// snackpack!

import commander from 'commander'
import path from 'path'
import { mergeWith, isArray, isFunction } from 'lodash'
import { Console } from 'console'
import { inspect } from 'util'
import webpack from 'webpack'

const colorize = x => inspect(x, false, 3, true)

const identity = x => x

const passthrough = (stream, formatter) => {
  const c = new Console(stream, stream)
  const f = formatter ? formatter : identity
  return msg => { c.log(f(msg)); return msg }
}
const stderr = passthrough(process.stderr, colorize)
const stdout = passthrough(process.stdout, colorize)

const concatArraysMergeCustomizer = (objValue, srcValue) => {
  if (isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

const mergeDeep = (...objs) => mergeWith(...objs, (objValue, srcValue) => {
  if (isArray(objValue)) {
    return objValue.concat(srcValue);
  }
})

const handleWebpackErrors = (err, stats) => {
  if (err) { stderr(err); throw new Error(`webpack build error: ${err}`) }
  const statsAsJson = stats.toJson()
  if (statsAsJson.errors.length > 0) { stderr(statsAsJson.errors); throw new Error(`webpack build error: ${statsAsJson.errors}`) }
  if (statsAsJson.warnings.length > 0) stderr(statsAsJson.warnings)
}

const meta = require('./package.json')

const snackpack = ({debugMode, confDir, manifestFile, environments, cmd}) => {
  const debug =
    debugMode
      ? stderr
      : identity

  debug({confDir, manifestFile, environments, cmd, debugMode})
  //
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
      const e = manifest[environment]
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

  const applyConfig = (oldConfig, newConfig) =>
    isFunction(newConfig)
      ? newConfig(oldConfig)
      : mergeDeep(oldConfig, newConfig)

  // build config
  const buildConfig = (environments, builders) => {
    const config = environments.reduce((lastEnvironmentConfig, environment) => {
      return builders.reduce((lastBuilderConfig, builder) => {
        debug(`builder: ${builder}, environment: ${environment}`)
        const newConfig = configFor(builder, environment)
        debug({lastBuilderConfig, newConfig})
        const out = applyConfig(lastBuilderConfig, newConfig)
        debug({out})
        return out
      }, lastEnvironmentConfig)
    }, {})
    debug({config})
    return config
  }

  const config = buildConfig(environments, builders)

  const webpackCallback = (err, stats) => {
    handleWebpackErrors(err, stats)
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

  stdout('done')
  debug(config)

  switch (cmd) {
    case 'config':
      return config
    case 'run':
    case 'watch':
      return webpackDo(cmd)(config)
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
  .option('-c, --conf-dir [confDir]', 'Set the configuration directory [config]', 'config')
  .option('-m, --manifest [manifest]', 'Set the manifest file [snackpack.js]', 'snackpack.js')
  .option('-d, --debug-mode', 'Use debug mode')
  .parse(process.argv)

// parse args
const {confDir, manifest, debugMode, args} = command
const [cmd, ..._environments] = args
const environments = ['defaults', ..._environments]

const confOutput = snackpack({environments, confDir, manifestFile: manifest, debugMode, cmd})

export default snackpack

