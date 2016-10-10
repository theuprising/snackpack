import { compose } from 'ramda'
import { requireLoader, addBabelPlugin, addBabelPreset } from '../../builder-util'

export default compose(
  addBabelPlugin('transform-class-properties'),
  addBabelPlugin('jsx-control-statements'),
  addBabelPlugin('transform-decorators-legacy'),
  addBabelPlugin('transform-react-display-name'),
  addBabelPlugin('transform-object-rest-spread'),
  addBabelPreset('stage-0'),
  addBabelPreset('react-optimize'),
  requireLoader('babel-loader')
)
