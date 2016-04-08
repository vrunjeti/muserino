import React from 'react'
import { render } from 'react-dom'
import { TestTButtons } from './components'

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
            <TestTButtons />
          </div>
        </body>
      </div>
    )
  }
}