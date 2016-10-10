import { compose } from 'ramda'
import { requireLoader, addBabelPreset } from '../../builder-util'

export default compose(
  addBabelPreset('react'),
  requireLoader('babel-loader')
)

