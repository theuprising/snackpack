import React from 'react'
import ReactDOM from 'react-dom'
import reactHotLoader from 'react-hot-loader'

import App from './App'

require('../css/index.css')
require('../pug/index.pug')
require('../html/index2.html')

ReactDOM.render((
  <reactHotLoader.AppContainer>
    <App />
  </reactHotLoader.AppContainer>
), document.getElementById('app'))

const alert = text => {
  console.log(text)
  const el = document.createElement('div')
  el.innerHTML = `
    <span style="position: absolute; top: 0; left: 0; font-size: 24px; z-index: 1000000">
      ${text}
    </span>
  `
  document.body.appendChild(el)
  setTimeout(() => document.body.removeChild(el), 60)
  setTimeout(() => document.body.appendChild(el), 80)
  setTimeout(() => document.body.removeChild(el), 140)
}

if (module.hot) {
  module.hot.accept('./App', () => {
    alert('👏🏾')
    const A = require('./App').default
    ReactDOM.render(
      <reactHotLoader.AppContainer>
        <A />
      </reactHotLoader.AppContainer>,
      document.getElementById('app')
    )
  })
}

