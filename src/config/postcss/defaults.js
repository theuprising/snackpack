import { evolve, merge, compose, append } from 'ramda'
import webpack from 'webpack'
import autoprefixer from 'autoprefixer'
import precss from 'precss'

export default evolve({
  module: {
    loaders: append({
      test: /\.css$/,
      loader: 'style-loader!css-loader!postcss-loader'
    })
  },
  plugins: append(
    new webpack.LoaderOptionsPlugin({
      // test: /\.xxx$/, // may apply this only for some modules
      options: {
        postcss: [precss, autoprefixer]
      }
    })
  )
})

