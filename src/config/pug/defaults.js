import { merge, append, compose, evolve } from 'ramda'

export default evolve({
  module: {
    loaders: append({
      test: /\.(pug|jade)$/,
      loader: 'file?name=[name].html!pug-html-loader'
    })
  }
})
