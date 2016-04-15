import React from 'react'
import { render } from 'react-dom'
import request from 'superagent'
import Timeline from './Timeline'

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

      const { drumSet } = this.state
      if (!drumSet) {
        this.loadDrums()
      }
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
    const { drumSet } = this.state
    if (!drumSet) return
    const { bassDrum, hiHatClosed, hiHatOpen, snare, ride } = drumSet

    // play with .bang()
    hiHatOpen.bang()
  }

  stopDrums() {
    const { drumSet } = this.state
    if (!drumSet) return
    const { bassDrum, hiHatClosed, hiHatOpen, snare, ride } = drumSet

    // pause with .pause()
    hiHatOpen.pause()
  }

  loadDrums() {
    const drumSetAudioFiles = [
      '../sounds/bass-drum.wav',
      '../sounds/hi-hat-closed.wav',
      '../sounds/hi-hat-open.wav',
      '../sounds/snare1.wav',
      '../sounds/ride.wav'
    ]

    const promises = drumSetAudioFiles.map(file => T('audio').loadthis(file))

    Promise.all(promises).then(res => {
      console.log('res', res)
      const res2 = res.map(i => i.play())
      const [ bassDrum, hiHatClosed, hiHatOpen, snare, ride ] = res2

      console.log('res2', res2)

      // TODO: find out a way to make it play() so it starts, 
      // but not actually produce sound
      const drumSet = {
        bassDrum: bassDrum,
        hiHatClosed: hiHatClosed,
        hiHatOpen: hiHatOpen,
        snare: snare,
        ride: ride
      }

      this.setState({ drumSet: drumSet, drumSetArr: res2 })
    }).catch(err => {
      console.log('err', err)
    })
  }

  playDrumBeat(tempo, loopCount) {
    const { drumSetArr } = this.state
    if (!drumSetArr) return
    const [ bassDrum, hiHatClosed, hiHatOpen, snare, ride ] = drumSetArr

    const timeOut = 60/tempo * 1000
    let loopPlayCount = 1

    playDrumMeasure(sampleDrumMeasure, drumSetArr, timeOut)
    const interval = setInterval(() => {
      if (loopPlayCount === loopCount) {
        clearInterval(interval)
      } else {
        playDrumMeasure(sampleDrumMeasure, drumSetArr, timeOut)
        loopPlayCount++
      }
    }, timeOut * sampleDrumMeasure.length)
  }

  playMidiTrack(tempo, loopCount) {
    const timeOut = 60/tempo * 1000
    let loopPlayCount = 1

    playMidiMeasure(sampleLeadMeasure, timeOut)
    const interval = setInterval(() => {
      if (loopPlayCount >= loopCount) {
        clearInterval(interval)
      } else {
        playMidiMeasure(sampleLeadMeasure, timeOut)
        loopPlayCount++
      }
    }, timeOut * sampleLeadMeasure.length)
  }

  playAllChannels(tempo, loopCount) {
    tempo = 180
    loopCount = 4
    const timeOut = 60/tempo * 1000

    this.playDrumBeat(tempo, loopCount)
    this.playMidiTrack(tempo, loopCount)
  }

  bangA4() {
    const { tArr } = this.state
    if (!tArr) return

    console.log(tArr)
    tArr[0].bang()
  }

  playA4() {
    const tempo = 180
    const timeOut = 60/tempo * 1000
    playMidiNote(69, 80, 1, timeOut)
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
          <button className="btn" onClick={this.stopDrums.bind(this)}>Stop Drums</button>
          <button className="btn" onClick={this.playDrumBeat.bind(this)}>Drum Beat</button>
          <button className="btn" onClick={this.bangA4.bind(this)}>Bang A4</button>
          <button className="btn" onClick={this.playA4.bind(this)}>Play A4</button>
          <button className="btn" onClick={this.playAllChannels.bind(this)}>Play All</button>
        </div>
        <Timeline />
      </div>
    )
  }
}

// wiki midi tuning standard
function convertMidiToFreq(midiNoteNumber) {
  const A4 = 440
  return Math.pow(2, (midiNoteNumber - 69)/12) * A4
}

function playDrumMeasure(measure, instrument, timeOut) {
  console.log('drum measure', measure)
  measure.forEach((count, index) => {
    setTimeout(() => {
      for (let notes of count) {
        const [ note, velocity, noteLength ] = notes
        instrument[note].bang()
      }
    }, index * timeOut)
  })
}

function playMidiMeasure(measure, timeOut) {
  // const tempo = 120
  // timeOut = 60/tempo * 1000
  console.log('timeOut', timeOut)
  console.log('midi measure', measure)

  measure.forEach((count, index) => {
    console.log('count', count)
    setTimeout(() => {
      if (count[0].length) {
        for (let notes of count) {
          console.log('notes', notes)
          const [ midiNoteNumber, velocity, noteLength ] = notes
          playMidiNote(midiNoteNumber, velocity, noteLength, timeOut)
        }
      }
    }, index * timeOut)
  })
}

function playMidiNote(midiNoteNumber, velocity, duration, timeOut) {
  const freq = convertMidiToFreq(midiNoteNumber)
  const note = T('sin', { freq: freq, mul: velocity/100 })
  duration = timeOut * duration

  note.play()
  setTimeout(() => {
    note.pause()
  }, duration)
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

// note is represented as [midi key, velocity, note length]
const sampleLeadMeasure = [
  [[60, 80, 0.25]], 
  [[]],
  [[62, 80, 0.125]],
  [[64, 80, 0.125]],
  [[65, 80, 0.5]],
  [[]],
  [[]],
  [[]]
]

// 0 - bassDrum
// 1 - hiHatClosed
// 2 - hiHatOpen
// 3 - snare
// 4 - ride
const sampleDrumMeasure = [
  [[0, 80, 0.25], [1, 80, 0.25]],
  [               [1, 80, 0.25]],
  [               [1, 80, 0.25],              [3, 80, 0.25]],
  [               [1, 80, 0.25]],
  [               [1, 80, 0.25]],
  [[0, 80, 0.25], [1, 80, 0.25]],
  [               [1, 80, 0.25],               [3, 80, 0.25]],
  [                              [2, 80, 0.25]] 
]
