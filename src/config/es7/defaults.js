import { compose } from 'ramda'
import { requireLoader, addBabelPlugin } from '../../builder-util'

export default compose(
  addBabelPlugin('transform-class-properties'),
  requireLoader('babel-loader')
)

