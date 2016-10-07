import { evolve, append, compose, map } from 'ramda'

const checkForLoader = loader => conf =>
  conf.module.loaders.find(l => l.loader === loader)

const requireLoader = loader => conf => {
  if (!checkForLoader(loader)(conf)) throw new Error(`the ${loader} is required`)
  return conf
}

const addBabelPreset = preset =>
  evolve({
    module: {
      loaders: map(
        loader => {
          if (loader.loader !== 'babel-loader') return loader
          return evolve({
            query: {
              presets: append(preset)
            }
          }, loader)
        }
      )
    }
  })

export default compose(
  addBabelPreset('react'),
  requireLoader('babel-loader')
)

