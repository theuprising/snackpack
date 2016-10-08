import { evolve, merge, compose, set, append, lensProp } from 'ramda'
import autoprefixer from 'autoprefixer'
import precss from 'precss'

const addStructure = merge({
  module: { loaders: [] },
  entry: []
})

const evolver = evolve({
  module: {
    loaders: append({
      test: /\.css$/,
      loader: 'style-loader!css-loader!postcss-loader'
    })
  }
})

export default compose(
  set(lensProp('postcss'), () => [precss, autoprefixer]),
  evolver,
  addStructure
)
