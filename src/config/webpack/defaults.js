import { compose, map } from 'ramda'
import path from 'path'
import glob from 'glob'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { projectPath, manifest } from '../../util'

export default {
  plugins: [
    new CopyWebpackPlugin([
      { from: `${manifest.paths.resources}/**/*` }
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
  entry: ['index.js'],
  resolve: {
    moduleDirectories: ['node_modules'],
    root: map(path.resolve)(glob.sync(`./${manifest.paths.src}/*`)),
    packageMains: ['webpack', 'browser', 'web', 'main'], // use the files in package.json.main, etc
    // extensions: ['', '.js', '.json']
  }
}
