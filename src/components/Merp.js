import React from 'react'
import { render } from 'react-dom'
import request from 'superagent'

let T

export default class Merp extends React.Component {

  constructor() {
    super()
    this.state = {
      isPlaying: [],
      tArr: []
    }
    this.handlePlay = this.handlePlay.bind(this)
  }

  componentDidMount() {
    setTimeout(() => {
      T = window.T
      // T("sin", {freq:400, mul:0.5}).play()
    }, 200)
  }

  handlePlay(index) {
    let { isPlaying } = this.state
    isPlaying[index] = (isPlaying[index]) ? false : true
    this.setState({ isPlaying: isPlaying }, this.playOrPause(index))
  }

  playOrPause(index) {
    const { isPlaying, tArr } = this.state
    const freq = 440 * (index + 1)

    if (isPlaying[index]) {
      if (tArr[index]) {
        tArr[index].play()
      } else {
        tArr[index] = T("sin", { freq:freq, mul:0.5 })
        tArr[index].play()
      }
    } else {
      // tArr[index] should already be set
      tArr[index].pause()
    }
    this.setState({ tArr: tArr })
  }

  render() {
    const { isPlaying } = this.state
    const buttonText = (index) => ((isPlaying[index]) ? 'Pause ' : 'Play ') + (index + 1)
    
    return (
      <div>
        <div className="row"></div>
        <div className="row">
          <button className="btn" onClick={this.handlePlay.bind(this, 0)}>{ buttonText(0) }</button>
          <button className="btn" onClick={this.handlePlay.bind(this, 1)}>{ buttonText(1) }</button>
        </div>
      </div>
    )
  }
}