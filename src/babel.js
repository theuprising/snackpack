// @flow

import R from 'ramda'

/**
 * @name babel
 * @param {WebpackConfig} config
 * @returns {WebpackConfig} config
 * @sig Config -> Config
 * @desc
 * adds the babel loader for `/\.jsx?$/` files
 */
export default R.evolve({
  module: {
    loaders: R.append({
      test: /\.jsx?$/,
      exclude: /(node_modules|webpack\/hot)/,
      loader: 'babel-loader'
    })
  }
})

