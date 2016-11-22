// @flow

import {concat, evolve} from 'ramda'
import HappyPack from 'happypack'

/**
 * @name happypack
 * @desc
 * adds the happypack metaloader for faster builds
 * @param {WebpackConfig} config
 * @returns {WebpackConfig} config
 * @sig Config -> Config
 */
export default (conf: Object): Object => {
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

