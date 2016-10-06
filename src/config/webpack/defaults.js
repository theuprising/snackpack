const path = require('path')

exports.default = {
  plugins: [],
  module: {
    noParse: /^\..+$/, // do not parse hidden files
    loaders: []
  },
  output: {
    path: path.join(process.cwd(), 'dist'),
    publicPath: '/hoodoo',
    filename: 'index.js'
  },
  entry: ['index.js'],
  resolve: {
    root: path.join(process.cwd(), 'src'),
    moduleDirectories: ['node_modules'],
    packageMains: ['webpack', 'browser', 'web', 'main'], // ???
    extensions: ['', '.js', '.json']
  }
}

