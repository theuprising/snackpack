import {concat, evolve} from 'ramda'
import HappyPack from 'happypack'

export default conf => {
  const loaders = conf.module.loaders
  return evolve({
    module: {
      loaders: () => [ 'happypack/loader' ],
      plugins: concat(
        new HappyPack({
          loaders
        })
      )
    }
  })(conf)
}

