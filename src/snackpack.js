// snackpack!

import commander from 'commander'
import path from 'path'
import { merge } from 'lodash'
import { Console } from 'console'

const meta = require('./package.json')

const snackpack = ({debugMode, confDir, manifestFile, environments}) => {
  const passthrough = stream => {
    const c = new Console(stream, stream)
    return msg => { c.log(msg); return msg }
  }
  const stderr = passthrough(process.stderr)
  const stdout = passthrough(process.stdout)

  const log = stderr
  const debug =
    debugMode
      ? stderr
      : x => x

  // const log = m => {console.log(m); return m}
  // const debug = log

  debug({confDir, manifestFile, environments})
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
    }, [])

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

  const config = buildConfig(environments, builders)
  stdout('exports.default=' + JSON.stringify(config))

  log('done')
}

// arg parser
const command = commander
  .version(meta.version)
  .usage('[options] [environments...]')
  .arguments('[environments...]')
  .option('-c, --conf-dir [confDir]', 'Set the configuration directory [config]', 'config')
  .option('-m, --manifest [manifest]', 'Set the manifest file [snackpack.js]', 'snackpack.js')
  .option('-d, --debug-mode', 'Use debug mode')
  .parse(process.argv)

// parse args
const {confDir, manifest, debugMode, args} = command
const environments = ['defaults', ...args]

snackpack({environments, confDir, manifestFile: manifest, debugMode})

