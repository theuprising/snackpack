import { evolve, merge, compose, set, append, lensProp } from 'ramda'
import autoprefixer from 'autoprefixer'
import precss from 'precss'

const addStructure = merge({
  module: { loaders: [] },
  entry: []
})

export default compose(
  evolve({
    entry: append('index.css'),
    module: {
      loaders: append({
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      })
    }
  }),
  set(lensProp('postcss'), () => [precss, autoprefixer]),
  addStructure
)
