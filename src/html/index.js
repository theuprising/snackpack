import { append, compose, evolve } from 'ramda'

const evolver = evolve({
  module: {
    loaders: append({
      test: /\.html$/,
      loader: 'file?name=[name].html'
    })
  }
})

export default compose(
  evolver
)

