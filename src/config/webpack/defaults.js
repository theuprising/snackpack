import path from 'path'
import CopyWebpackPlugin from 'copy-webpack-plugin'

export default {
  plugins: [
    new CopyWebpackPlugin([
      { from: 'resources/index.html' }
    ])
  ],
  module: {
    noParse: /^\..+$/, // do not parse hidden files
    loaders: []
  },
  output: {
    path: path.join(process.cwd(), 'dist'),
    publicPath: '/',
    filename: 'index.js'
  },
  entry: ['index.js'],
  resolve: {
    moduleDirectories: ['node_modules'],
    root: [
      path.resolve('./src'),
      path.resolve('./src/js')
    ],
    packageMains: ['webpack', 'browser', 'web', 'main'], // use the files in package.json.main, etc
    extensions: ['', '.js', '.json']
  }
}

