import fs from 'fs'
import {set, lensProp, compose, map} from 'ramda'

const detupelize = arrOfTupels => {
  let obj = {}
  arrOfTupels.forEach(t => {
    const [key, value] = t
    obj[key] = value
  })
  return obj
}

const makeExterns = compose(
  detupelize,
  map(m => [m, `commonjs ${m}`])
)

export default compose(
  set(lensProp('externals'), makeExterns(fs.readdirSync('node_modules'))),
  set(lensProp('target'), 'node')
)

