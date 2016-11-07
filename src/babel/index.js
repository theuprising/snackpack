import { evolve, append, prepend, map } from 'ramda'

export default evolve({
  entry: map(prepend('babel-polyfill')),
  module: {
    loaders: append({
      test: /\.jsx?$/,
      exclude: /(node_modules|webpack\/hot)/,
      loader: 'babel-loader',
      query: {
        presets: [['es2015', {modules: false}]],
        plugins: []
      }
    })
  }
})

