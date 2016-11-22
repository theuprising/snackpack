// @flow

import { evolve, append } from 'ramda'
import { BannerPlugin } from 'webpack'

/**
 * @name node-development
 * @param {WebpackConfig} config
 * @returns {WebpackConfig} config
 * @sig Config -> Config
 * @desc
 * adds source map support to the top of every file
 */
export default evolve({
  plugins: append(
    new BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false
    })
  )
})

