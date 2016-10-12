import { evolve, append } from 'ramda'
import { BannerPlugin } from 'webpack'

export default evolve({
  plugins: append(
    new BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false
    })
  )
})

