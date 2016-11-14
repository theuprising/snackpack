import { LoaderOptionsPlugin, optimize } from 'webpack'
import { compose, evolve, append } from 'ramda'

export default compose(
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
