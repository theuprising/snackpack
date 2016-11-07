import { evolve, append, map, compose, merge } from 'ramda'

export const projectPath = process.cwd()

export const checkForLoader = loader => conf =>
  conf.module.loaders.find(l => l.loader === loader)

export const requireLoader = loader => conf => {
  if (!checkForLoader(loader)(conf)) throw new Error(`the ${loader} is required`)
  return conf
}

export const addBabelPreset = preset =>
  evolve({
    module: {
      loaders: map(
        loader => {
          if (loader.loader !== 'babel-loader') return loader
          return compose(
            evolve({
              query: {
                presets: append(preset)
              }
            }),
            merge({
              query: { presets: [] }
            })
          )(loader)
        }
      )
    }
  })

export const addBabelPlugin = plugin =>
  evolve({
    module: {
      loaders: map(
        loader => {
          if (loader.loader !== 'babel-loader') return loader
          return compose(
            evolve({
              query: {
                plugins: append(plugin)
              }
            }),
            merge({
              query: { plugins: [] }
            })
          )(loader)
        }
      )
    }
  })

