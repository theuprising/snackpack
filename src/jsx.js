// @flow

import { compose } from 'ramda'
import { requireLoader, addBabelPreset } from './util'

/**
 * @name jsx
 * @param {WebpackConfig} config
 * @returns {WebpackConfig} config
 * @sig Config -> Config
 * @desc
 * adds the react babel preset
 */
export default compose(
  addBabelPreset('react'),
  requireLoader('babel-loader')
)

