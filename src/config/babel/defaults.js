exports.default = {
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /(node_modules|webpack\/hot)/,
      loader: 'babel-loader',
      query: {
        presets: [['es2015', {modules: false}]],
        plugins: []
      }
    }]
  }
}

