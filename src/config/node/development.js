import { evolve, concat } from 'ramda'
import {BannerPlugin} from 'webpack'

export default evolve({
  plugins: concat(
    new BannerPlugin(
      'require("source-map-support").install();',
      { raw: true, entryOnly: false }
    )
  )
})
