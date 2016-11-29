import { map, type, compose } from 'ramda'
import path from 'path'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { projectPath } from './util'

const source = src => path.resolve(projectPath, src)

const sources = src => {
  if (type(src) === 'Array') {
    return map(source)(src)
  }
  return [source(src)]
}

const validateEntry = compose(
  map(e => {
    if (type(e) !== 'Array') throw new Error('entry values must be arrays')
    return e
  }),
  entry => {
    if (type(entry) !== 'Object') throw new Error('entry must be an object')
    return entry
  }
)

export type Entry = any
export type WebpackOptions = {
  projectPath: string,
  paths: {
    src: string,
    resources: string,
    dist: string
  },
  entry: Entry
}

/**
 * @name webpack
 * @param {WebpackOptions} options
 * @returns {WebpackConfig} config
 * @sig WebpackOptions -> Config
 * @desc
 * unary, not binary like the others. produces a basic webpack.config
 */
export default options => ({
  plugins: [
    new CopyWebpackPlugin([
      { from: `${options.paths.resources}` }
    ])
  ],
  module: {
    noParse: /^\..+$/, // do not parse hidden files
    loaders: [{
      test: /\.json$/,
      loader: 'json-loader'
    }]
  },
  output: {
    path: path.join(projectPath, options.paths.dist),
    publicPath: '/',
    filename: '[name].js'
  },
  stats: {
    errorDetails: true,
    colors: true,
    modules: true,
    reasons: true
  },
  devtool: 'source-map',
  entry: validateEntry(options.entry),
  resolve: {
    modules: [
      ...sources(options.paths.src),
      'node_modules'
    ]
  }
})

