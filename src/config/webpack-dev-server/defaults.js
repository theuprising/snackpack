import { evolve, merge, prepend, append, compose, type, map } from 'ramda'
import { join } from 'path'
import webpack from 'webpack'
import { manifest, projectPath, requireLoader, addBabelPlugin } from '../../builder-util'

const conf = manifest.builders['webpack-dev-server']

const addStructure = merge({
  entry: [],
  module: { loaders: [] },
  plugins: []
})

const curriedJoin = a => b => join(a, b)
const resolveSource = curriedJoin(projectPath)

const sources = src => {
  if (type(src) === 'Array') {
    return map(resolveSource)(src)
  } else {
    return resolveSource(src)
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
  plugins: append(new webpack.HotModuleReplacementPlugin())
})

export default compose(
  evolver,
  addStructure,
  addBabelPlugin('react-hot-loader/babel'),
  requireLoader('babel-loader')
)

