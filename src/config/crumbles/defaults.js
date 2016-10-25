import { evolve, omit, update, findIndex } from 'ramda'

export default evolve({
  externals: omit(['.bin', 'crumbles', '.yarn-integrity']),
  module: {
    loaders: loaders => {
      const babelLoaderIndex = findIndex(l => l.loader === 'babel-loader', loaders)
      const babelLoader = loaders[babelLoaderIndex]
      console.log({babelLoader, babelLoaderIndex, loaders})
      return update(
        babelLoaderIndex,
        {
          ...babelLoader,
          exclude: /node_modules\/(?!crumbles)|webpack\/hot/
        },
        loaders
      )
    }
  }
})

