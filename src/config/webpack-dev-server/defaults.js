import { evolve, concat, merge, prepend, append, compose } from 'ramda'
import { join } from 'path'
import webpack from 'webpack'

const addStructure = merge({
  entry: [],
  module: { loaders: [] },
  plugins: [],
  devServer: {
    // hot: true,
    https: true,
    compress: true,
    contentBase: './dist',
    colors: true
  }})

const evolver = evolve({
  entry: concat([
    'webpack-dev-server/client?http://0.0.0.0:3000',
    'webpack/hot/only-dev-server'
  ]),
  module: {
    loaders: prepend({
      test: /.jsx?$/,
      loaders: ['react-hot-loader/webpack', 'jsx?harmony'],
      include: join(process.cwd(), 'src')
    })
  },
  plugins: append(new webpack.HotModuleReplacementPlugin())
})

export default compose(evolver, addStructure)

