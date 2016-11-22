// @flow

import { compose } from 'ramda'
import { requireLoader, addBabelPlugin, addBabelPreset } from './util'

/**
 * @name es7
 * @param {WebpackConfig} config
 * @returns {WebpackConfig} config
 * @sig Config -> Config
 * @desc
 * adds a bunch of babel plugins for es7 crap
 *
 * It's probably better to just use a babelrc tbh
 */
export default compose(
  addBabelPlugin('transform-class-properties'),
  addBabelPlugin('jsx-control-statements'),
  addBabelPlugin('transform-decorators-legacy'),
  addBabelPlugin('transform-react-display-name'),
  addBabelPlugin('transform-object-rest-spread'),
  addBabelPreset('stage-0'),
  addBabelPreset('latest'),
  addBabelPreset('react-optimize'),
  requireLoader('babel-loader')
)

