import { evolve, append } from 'ramda'

export default evolve({
  entry: e => ['babel-polyfill', ...e],
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

