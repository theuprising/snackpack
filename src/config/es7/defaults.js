import { compose } from 'ramda'
import { requireLoader, addBabelPlugin, addBabelPreset } from '../../builder-util'

export default compose(
  addBabelPlugin('transform-class-properties'),
  addBabelPlugin('jsx-control-statements'),
  addBabelPlugin('transform-decorators-legacy'),
  addBabelPlugin('transform-react-display-name'),
  addBabelPlugin('transform-es2015-destructuring'),
  addBabelPreset('react-optimize'),
  requireLoader('babel-loader')
)
