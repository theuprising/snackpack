import { evolve, append, map } from 'ramda'

export const projectPath = process.cwd()
export const manifest = global.__snackpackManifest

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
          return evolve({
            query: {
              presets: append(preset)
            }
          }, loader)
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
          return evolve({
            query: {
              plugins: append(plugin)
            }
          }, loader)
        }
      )
    }
  })

