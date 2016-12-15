// @flow

import { evolve, append, prepend, map } from 'ramda'

/**
 * @name babel
 * @param {WebpackConfig} config
 * @returns {WebpackConfig} config
 * @sig Config -> Config
 * @desc
 * adds the babel loader for `/\.jsx?$/` files
 */
export default evolve({
  module: {
    loaders: append({
      test: /\.jsx?$/,
      exclude: /(node_modules|webpack\/hot)/,
      loader: 'babel-loader'
    })
  }
})

