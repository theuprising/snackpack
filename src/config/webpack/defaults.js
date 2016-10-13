import { map, type } from 'ramda'
import path from 'path'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { projectPath, manifest } from '../../builder-util'

const source = src => path.resolve(projectPath, src)

const sources = src => {
  if (type(src) === 'Array') {
    return map(source)(src)
  }
  return [source(src)]
}

const moduleSources = sources(manifest.paths.src)

export default {
  plugins: [
    new CopyWebpackPlugin([
      { from: `${manifest.paths.resources}` }
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
    path: path.join(projectPath, manifest.paths.dist),
    publicPath: '/',
    filename: manifest.builders.webpack.outputFilename
  },
  stats: {
    errorDetails: true,
    colors: true,
    modules: true,
    reasons: true
  },
  entry: type(manifest.builders.webpack.entry) === 'Array'
    ? manifest.builders.webpack.entry
    : [manifest.builders.webpack.entry],
  resolve: {
    modules: [
      ...moduleSources,
      'node_modules'
    ]
  }
}

