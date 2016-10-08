import { merge, append, compose, evolve } from 'ramda'

const addStructure = merge({
  module: { loaders: [] },
  entry: []
})

const evolver = evolve({
  module: {
    loaders: append({
      test: /\.html$/,
      loader: 'file?name=[name].html'
    })
  }
})

export default compose(
  evolver,
  addStructure
)

