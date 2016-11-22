// @flow

import { append, evolve } from 'ramda'

/**
 * @name pug
 * @param {WebpackConfig} config
 * @returns {WebpackConfig} config
 * @sig Config -> Config
 * @desc
 * adds a static pug/jade loader
 */
export default evolve({
  module: {
    loaders: append({
      test: /\.(pug|jade)$/,
      loader: 'file?name=[name].html!pug-html-loader'
    })
  }
})
