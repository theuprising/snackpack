// @flow

import { append, evolve } from 'ramda'

/**
 * @name html
 * @desc
 * adds a static html loader
 * @param {WebpackConfig} config
 * @returns {WebpackConfig} config
 * @sig Config -> Config
 */
export default evolve({
  module: {
    loaders: append({
      test: /\.html$/,
      loader: 'file?name=[name].html'
    })
  }
})

