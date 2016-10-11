import { evolve, merge, prepend, append, compose, reduce, type, map, concat } from 'ramda'
import { join } from 'path'
import webpack from 'webpack'
import { manifest, projectPath, requireLoader, addBabelPlugin } from '../../builder-util'

const conf = manifest.builders['webpack-dev-server']

const addStructure = merge({
  entry: [],
  module: { loaders: [] },
  plugins: []
})

const sources = src => {
  if (type(src) === 'Array') {
    return compose(
      reduce(concat, []),
      map(s => join(projectPath, src))
    )(src)
  } else {
    return join(projectPath, src)
  }
}

const evolver = evolve({
  entry: compose(
    prepend('react-hot-loader/patch'),
    prepend(`webpack-hot-middleware/client?reload=true&path=${conf.protocol}://${conf.host}:${conf.port}/__webpack_hmr`)
  ),
  module: {
    loaders: prepend({
      test: /.jsx?$/,
      loaders: ['react-hot-loader/webpack'],
      include: sources(manifest.paths.src)
    })
  },
  plugins: compose(
    append(new webpack.HotModuleReplacementPlugin()),
    append(new webpack.LoaderOptionsPlugin({
      options: {
        devServer: {
          historyApiFallback: true,
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

