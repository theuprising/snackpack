export default {
  paths: {
    dist: 'dist',
    src: 'src',
    resources: 'resources'
  },
  builders: {
    webpack: {
      entry: ['index.js'],
      outputFilename: 'index.js'
    },
    'webpack-dev-server': {
      port: 8080,
      protocol: 'http',
      host: '0.0.0.0',
      proxy: {
        target: 'http://localhost:3000'
      }
    }
  }
}
