import { merge, append, compose, evolve } from 'ramda'

const addStructure = merge({
  module: { loaders: [] },
  entry: []
})

const evolver = evolve({
  module: {
    loaders: append({
      test: /\.(pug|jade)$/,
      loader: 'file?name=[name].html!pug-html-loader'
    })
  }
})

export default compose(
  evolver,
  addStructure
)

