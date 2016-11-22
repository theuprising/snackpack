// @flow

import { evolve, assoc, prepend, append, compose, type, map } from 'ramda'
import { join } from 'path'
import webpack from 'webpack'
import { projectPath, requireLoader, addBabelPlugin } from './util'
import type { WebpackOptions } from './webpack'

const curriedJoin = a => b => join(a, b)
const resolveSource = curriedJoin(projectPath)

const sources = src => {
  if (type(src) === 'Array') {
    return map(resolveSource)(src)
  } else {
    return resolveSource(src)
  }
}

const evolver = (options: WebpackOptions) => evolve({
  output: assoc('devtoolModuleFilenameTemplate', '/[absolute-resource-path]'),
  entry: map(compose(
    prepend('react-hot-loader/patch'),
    prepend(`webpack-hot-middleware/client?reload=true&path=${options.protocol}://${options.host}:${options.port}/__webpack_hmr`)
  )),
  devtool: () => 'eval',
  module: {
    loaders: prepend({
      test: /.jsx?$/,
      loaders: ['react-hot-loader/webpack'],
      include: sources(options.paths.src)
    })
  },
  plugins: append(new webpack.HotModuleReplacementPlugin())
})

type WebpackDevServerOptions = {
  protocol: string,
  host: string,
  port: string
}

/**
 * @name webpackDevServer
 * @param {WebpackDevServerOptions} options
 * @param {WebpackConfig} config
 * @returns {WebpackConfig} config
 * @sig Config -> Config
 * @desc
 * adds react hot loader babel plugin, throws if babel-loader is not already present
 */
export default (options: WebpackDevServerOptions) => compose(
  evolver(options),
  addBabelPlugin('react-hot-loader/babel'),
  requireLoader('babel-loader')
)

