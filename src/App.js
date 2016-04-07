import React from 'react'
import { render } from 'react-dom'
import { Merp } from './components'

export default class App extends React.Component {
  render() {
    return (
      <div>
        <body>
          <nav>
            <div className="nav-wrapper container">
              <div className="brand-logo">Muserino</div>
            </div>
          </nav>
          <div className="container">
            <Merp />
          </div>
        </body>
      </div>
    )
  }
}