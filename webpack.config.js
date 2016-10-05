exports.default = { plugins: [],
  module: { noParse: /^\..+$/, loaders: [] },
  output: 
   { path: '/Users/ajm/data/snackpack/dist/',
     publicPath: '/',
     filename: 'index.js' },
  entry: 'index.js',
  resolve: 
   { root: '/Users/ajm/data/snackpack/src/',
     moduleDirectories: [ 'node_modules' ],
     packageMains: [ 'webpack', 'browser', 'web', 'main' ],
     extensions: [ '', '.js', '.json' ] },
  debug: true }
