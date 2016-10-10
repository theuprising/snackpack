import { evolve, merge, prepend, append, compose } from 'ramda'
import { join } from 'path'
import webpack from 'webpack'
import { manifest, projectPath } from '../../util'
import { requireLoader, addBabelPlugin } from '../../builder-util'

const conf = manifest.builders['webpack-dev-server']

const addStructure = merge({
  entry: [],
  module: { loaders: [] },
  plugins: []
})

const evolver = evolve({
  entry: compose(
    prepend(`webpack-hot-middleware/client?reload=true&path=${conf.protocol}://${conf.host}:${conf.port}/__webpack_hmr`),
    prepend('react-hot-loader/patch')
  ),
  module: {
    loaders: prepend({
      test: /.jsx?$/,
      loaders: ['react-hot-loader/webpack'],
      include: join(projectPath, manifest.paths.src)
    })
  },
  plugins: compose(
    append(new webpack.HotModuleReplacementPlugin()),
    append(new webpack.LoaderOptionsPlugin({
      options: {
        devServer: {
          hot: true,
          inline: true,
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
        }
      }
    }))
  )
})

export default compose(
  evolver,
  addStructure,
  addBabelPlugin('react-hot-loader/babel'),
  requireLoader('babel-loader')
)

