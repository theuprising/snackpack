import { compose } from 'ramda'
import { requireLoader, addBabelPlugin, addBabelPreset } from '../../builder-util'

export default compose(
  addBabelPlugin('transform-class-properties'),
  addBabelPlugin('jsx-control-statements'),
  addBabelPlugin('transform-decorators-legacy'),
  addBabelPlugin('transform-react-display-name'),
  addBabelPreset('react-optimize'),
  addBabelPreset('transform-es2015-destructuring'),
  requireLoader('babel-loader')
)

