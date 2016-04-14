import React from 'react'
import { render } from 'react-dom'
import request from 'superagent'

let T = window.T

export default class TestTButtons extends React.Component {

  constructor() {
    super()
    this.state = {
      isPlaying: [],
      tArr: []
    }
    this.handlePlay = this.handlePlay.bind(this)
  }

  componentDidMount() {
    // React components load faster than scripts in the window,
    // so this waits to set T, the reference to Timbre
    setTimeout(() => {
      // console.log(window.T)
      T = window.T
    }, 300)
  }

  /**
   * Toggles the buttons' isPlaying state,
   * calls playOrPause to handle the audio
   * @param  {Number} index [the index corresponding to a button and its Timbre object]
   */
  handlePlay(index) {
    let { isPlaying } = this.state
    isPlaying[index] = (isPlaying[index]) ? false : true
    this.setState({ isPlaying: isPlaying }, this.playOrPause(index))
  }

  /**
   * Plays or pauses the Timbre object at the given index
   * Frequency is currently calculated based on the index
   * @param  {Number} index [the index corresponding to a button and its Timbre object]
   */
  playOrPause(index) {
    const { isPlaying, tArr } = this.state

    // calculate frequency based on the index for now
    const freq = 110 * (index + 1)

    if (isPlaying[index]) {
      // check if the Timbre object at the given index exists, otherwise create a new one
      if (tArr[index]) {
        tArr[index].play()
      } else {
        tArr[index] = T('sin', { freq:freq, mul:0.5 })
        tArr[index].play()
      }
    } else {
      // tArr[index] should already be set, so no need to check if it exists or is true
      tArr[index].pause()
    }

    this.setState({ tArr: tArr })
  }

  playDrums() {
    const drumSetAudioFiles = [
      '../sounds/bass-drum.wav',
      '../sounds/hi-hat-closed.wav',
      '../sounds/hi-hat-open.wav',
      '../sounds/snare1.wav',
      '../sounds/ride.wav'
    ]
    const promises = drumSetAudioFiles.map(file => T('audio').loadthis(file))
    Promise.all(promises).then(res => {
      const [ bassDrum, hiHatClosed, hiHatOpen, snare, ride ] = res
      hiHatOpen.play()

    }).catch(err => {
      console.log('err', err)
    })
  }

  render() {
    const { isPlaying } = this.state
    const buttonText = (index) => ((isPlaying[index]) ? 'Pause ' : 'Play ') + (index + 1)

    return (
      <div>
        <div className="row"></div>
        <div className="row">
          {
            range(0, 5).map(num => {
              return <button
                key={num}
                className="btn"
                onClick={this.handlePlay.bind(this, num)}>
                { buttonText(num) }
              </button>
            })
          }
          <button className="btn" onClick={this.playDrums.bind(this)}>Drums</button>
        </div>
      </div>
    )
  }
}

/**
 * Returns an array with integers between start and end
 * @param  {Number} start [beginning of range]
 * @param  {Number} end   [ending of range, non inclusive]
 * @return {Array}        [array of integers from start to end]
 */
function range(start, end) {
  return Array.apply(0, Array(end)).map((element, index) => index + start)
}