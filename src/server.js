import http from 'http'
import express from 'express'
import fallback from 'express-history-api-fallback'
import webpack from 'webpack'
import path from 'path'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import { projectPath } from './builder-util'

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
  app.use(fallback('index.html', { root: path.join(projectPath, manifest.paths.dist) }))
  const port = manifest.builders['webpack-dev-server'].port
  server = http.createServer(app)
  server.listen(port, () => console.log(`Listening on port ${port}`))
}

export const stop = () => {
  console.log('Shutting down app')
  if (server) server.close()
}

