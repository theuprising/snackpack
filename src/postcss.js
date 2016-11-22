// @flow

import { evolve, append } from 'ramda'
import webpack from 'webpack'
import precss from 'precss'
import cssnext from 'postcss-cssnext'
import postcssImport from 'postcss-smart-import'

/**
 * @name postcss
 * @param {WebpackConfig} config
 * @returns {WebpackConfig} config
 * @sig Config -> Config
 * @desc
 * adds a postcss loader with:
 * - cssnext
 * - precss
 * note: output is a static css file, not a react style object
 */
export default evolve({
  module: {
    loaders: append({
      test: /\.css$/,
      loader: 'style-loader!css-loader!postcss-loader?parser=postcss-scss'
    })
  },
  plugins: append(
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: (webpack) => [
          postcssImport({
            addDependencyTo: webpack,
            from: 'css/partials'
          }),
          precss,
          cssnext
        ]
      }
    })
  )
})

