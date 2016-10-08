import { evolve, concat, merge, prepend, append, compose } from 'ramda'
import { join } from 'path'
import webpack from 'webpack'
import { manifest, projectPath } from '../../util'

const conf = manifest.builders['webpack-dev-server']

const addStructure = merge({
  entry: [],
  module: { loaders: [] },
  plugins: [],
  devServer: {
    hot: true,
    // inline: true,
    compress: true,
    contentBase: `./${manifest.paths.dist}`,
    colors: true,
    proxy: conf.proxy
      ? {
        '/api': {
          target: conf.proxy.target,
          pathRewrite: {'^/api': ''}
        }
      } : undefined
  }})

const evolver = evolve({
  entry: concat([
    `webpack-dev-server/client?http://localhost:${conf.port}`,
    'webpack/hot/only-dev-server'
  ]),
  module: {
    loaders: prepend({
      test: /.jsx?$/,
      loaders: ['react-hot-loader/webpack', 'jsx?harmony'],
      include: join(projectPath, manifest.paths.src)
    })
  },
  plugins: append(new webpack.HotModuleReplacementPlugin())
})

export default compose(evolver, addStructure)

