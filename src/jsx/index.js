import { compose } from 'ramda'
import { requireLoader, addBabelPreset } from '../util'

export default compose(
  addBabelPreset('react'),
  requireLoader('babel-loader')
)

