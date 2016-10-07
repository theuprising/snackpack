import React from 'react'
import ReactDOM from 'react-dom'
import style from '../css/index.css'

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
