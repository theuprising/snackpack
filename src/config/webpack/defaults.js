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
    filename: type(manifest.builders.webpack.entry) === 'Object'
      ? '[name].js'
      : manifest.builders.webpack.outputFilename
  },
  stats: {
    errorDetails: true,
    colors: true,
    modules: true,
    reasons: true
  },
  devtool: 'source-map',
  entry: (entry => {
    switch (type(entry)) {
      case 'Array':
        return entry
      case 'String':
        return [entry]
      case 'Object':
        return entry
    }
  })(manifest.builders.webpack.entry),
  resolve: {
    modules: [
      ...moduleSources,
      'node_modules'
    ]
  }
}

