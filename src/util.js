// @flow

import { pipe, evolve, append, map, compose, merge, curry } from 'ramda'

export const projectPath = process.cwd()

/**
 * @name util.checkForLoader
 * @param {string} loader
 * @param {WebpackConfig} config
 * @returns {boolean} loaderIsPresent
 * @sig string -> Config -> boolean
 * @desc
 * checks if the specified loader is present
 */
const _checkForLoader = (loader: string) => (conf: Object) =>
  conf.module.loaders.find(l => l.loader === loader)
export const checkForLoader = curry(_checkForLoader)

/**
 * @name util.requireLoader
 * @param {string} loader
 * @param {WebpackConfig} config
 * @returns {WebpackConfig} config
 * @sig string -> Config -> Config
 * @desc
 * checks if the specified loader is present. If so, passes through. If not, throws.
 */
export const requireLoader = (loader: string) => (conf: Object) => {
  if (!checkForLoader(loader)(conf)) throw new Error(`the ${loader} is required`)
  return conf
}

/**
 * @name util.addBabelPreset
 * @param {string} preset
 * @param {WebpackConfig} config
 * @returns {WebpackConfig} config
 * @sig string -> Config -> Config
 * @desc
 * adds a preset to the babel loader, throws if the babel loader is not already present
 */
const _addBabelPreset = (preset: string) =>
  evolve({
    module: {
      loaders: map(
        loader => {
          if (loader.loader !== 'babel-loader') return loader
          return compose(
            evolve({
              query: {
                presets: append(preset)
              }
            }),
            merge({
              query: { presets: [] }
            })
          )(loader)
        }
      )
    }
  })
export const addBabelPreset = (preset: string) => pipe(
  requireLoader('babel-loader'),
  _addBabelPreset(preset)
)

/**
 * @name util.addBabelPlugin
 * @param {string} plugin
 * @param {WebpackConfig} config
 * @returns {WebpackConfig} config
 * @sig string -> Config -> Config
 * @desc
 * adds a plugin to the babel loader, throws if the babel loader is not already present
 */
const _addBabelPlugin = (plugin: string) =>
  evolve({
    module: {
      loaders: map(
        loader => {
          if (loader.loader !== 'babel-loader') return loader
          return compose(
            evolve({
              query: {
                plugins: append(plugin)
              }
            }),
            merge({
              query: { plugins: [] }
            })
          )(loader)
        }
      )
    }
  })
export const addBabelPlugin = (plugin: string) => pipe(
  requireLoader('babel-loader'),
  _addBabelPlugin(plugin)
)

