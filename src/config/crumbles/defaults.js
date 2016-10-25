import { evolve, omit, update, findIndex, compose } from 'ramda'

console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ doing crumble thing ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
export default x => 'hello!'
//
//
// export default compose(
//   evolve({
//     externals: omit(['.bin', 'crumbles', '.yarn-integrity']),
//     module: {
//       loaders: loaders => {
//         console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ doing loader thing ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
//         const babelLoaderIndex = findIndex(l => l.loader === 'babel-loader', loaders)
//         const babelLoader = loaders[babelLoaderIndex]
//         console.log({babelLoader, babelLoaderIndex, loaders})
//         return update(
//           babelLoaderIndex,
//           {
//             ...babelLoader,
//             exclude: /node_modules\/(?!crumbles)|webpack\/hot/
//           },
//           loaders
//         )
//       }
//     }
//   }),
//   x => {
//     console.log('HELLO!@!!!!!!!!!!!!!!!!!!!!!!')
//     return x
//   }
// )

