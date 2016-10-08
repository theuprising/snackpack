import React from 'react'
import ReactDOM from 'react-dom'

require('../css/index.css')
require('../pug/index.pug')
require('../html/index2.html')

const List = ({children}) => (
  <ul>
    {React.Children.map(children, c => (
      <li>
        {c}
      </li>
     ))}
  </ul>
)

class Page extends React.Component {
  render () {
    return (
      <List>
        Hello World!
        <em>How are you?</em> I'm good.
      </List>
    )
  }
}

ReactDOM.render(<Page />, document.body)
