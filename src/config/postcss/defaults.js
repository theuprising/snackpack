import { evolve, append } from 'ramda'
import webpack from 'webpack'
import autoprefixer from 'autoprefixer'
import precss from 'precss'
import cssnext from 'postcss-cssnext'
import postcssImport from 'postcss-import'

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
        postcss: [
          postcssImport({addDependencyTo: webpack}),
          precss,
          cssnext,
          autoprefixer
        ]
      }
    })
  )
})

