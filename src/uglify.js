// @flow

import { LoaderOptionsPlugin, DefinePlugin, optimize } from 'webpack'
import { compose, evolve, append } from 'ramda'

/**
 * @name uglify
 * @param {WebpackConfig} config
 * @returns {WebpackConfig} config
 * @sig Config -> Config
 * @desc
 * adds dedupe, uglifyjs, minimize, and NODE_ENV=production
 */
export default compose(
  evolve({
    plugins: append(new DefinePlugin({
      'process.env.NODE_ENV': 'production'
    }))
  }),
  evolve({
    plugins: append(new LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }))
  }),
  evolve({
    plugins: append(new optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      },
      sourceMap: false
    }))
  }),
  evolve({
    plugins: append(new optimize.DedupePlugin())
  })
)

