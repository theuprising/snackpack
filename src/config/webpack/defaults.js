import { map } from 'ramda'
import path from 'path'
import glob from 'glob'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { projectPath, manifest } from '../../builder-util'

export default {
  plugins: [
    new CopyWebpackPlugin([
      { from: `${manifest.paths.resources}` }
    ])
  ],
  module: {
    noParse: /^\..+$/, // do not parse hidden files
    loaders: []
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
  entry: ['index.js'],
  resolve: {
    modules: [
      ...map(path.resolve)(glob.sync(`${projectPath}/${manifest.paths.src}/*`)),
      'node_modules'
    ]
  }
}
