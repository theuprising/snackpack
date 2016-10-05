const path = require('path')
const webpack = require('webpack')

exports.default = {
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:3000',
    'webpack/hot/only-dev-server'
  ],
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loaders: ['react-hot-loader/webpack', 'jsx?harmony'],
        include: path.join(process.cwd(), 'src')
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}

