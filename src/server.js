import http from 'http'
import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

const app = express()
let server

export const start = manifest => webpackConfig => {
  const compiler = webpack(webpackConfig)

  app.use(webpackDevMiddleware(compiler, webpackConfig.devServer))
  app.use(webpackHotMiddleware(compiler, {
    log: console.log,
    path: '/__webpack_hmr',
    heartbeat: 10 * 1000
  }))
  const port = manifest.builders['webpack-dev-server'].port
  server = http.createServer(app)
  server.listen(port, () => console.log(`Listening on port ${port}`))
}

export const stop = () => {
  console.log('Shutting down app')
  if (server) server.close()
}

