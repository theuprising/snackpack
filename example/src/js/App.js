import React from 'react'

const List = ({children}) => (
  <ul>
    {React.Children.map(children, c => (
      <li>{c}</li>
    ))}
  </ul>
)

export default class App extends React.Component {
  render () {
    return (
      <List>
        Hello World?
        <em>How are you?</em>
        I'm good.
      </List>
    )
  }
}

