import http from 'http'
import express from 'express'
import morgan from 'morgan'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

const app = express()
let server

const spaMiddleware = path => (req, res, next) => {
  if (req.method === 'GET' &&
      req.accepts('html') &&
      req.path.indexOf('.') === -1
  ) {
    req.url = path
    next()
  } else next()
}
export const start = manifest => webpackConfig => {
  const compiler = webpack(webpackConfig)
  app.use(morgan('dev'))
  app.use(spaMiddleware('/'))
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

