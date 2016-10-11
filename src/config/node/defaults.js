import fs from 'fs'
import {assoc, assocPath, compose, map, filter} from 'ramda'

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
  filter(m => m !== '.bin'),
  map(m => [m, `commonjs ${m}`])
)

export default compose(
  assocPath(['output', 'libraryTarget'], 'commonjs2'),
  assoc('externals', makeExterns(fs.readdirSync('node_modules'))),
  assoc('target', 'node'),
  assoc('node', {
    __filename: false,
    __dirname: false
  })
)

