import React from 'react'
import { render } from 'react-dom'
import request from 'superagent'
import { Timeline } from './'
import { sampleMeasures, utils } from './../utils'

const { convertMidiToFreq } = utils
let T = window.T

export default class Muse extends React.Component {

  constructor() {
    super()
    this.state = { drumSetArr: [] }
    this.playAllChannels = this.playAllChannels.bind(this)
  }

  componentDidMount() {
    // React components load faster than scripts in the window,
    // so this waits to set T, the reference to Timbre
    setTimeout(() => {
      T = window.T

      const { drumSetArr } = this.state
      if (!drumSetArr.length) {
        this.loadDrums()
      }
    }, 300)
  }

  /**
   * Loads all the sound samples for the drumset
   */
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
      // TODO: find out a way to make it play() so it starts, 
      // but not actually produce sound
      const drumSetArr = res.map(i => i.play())
      const [ bassDrum, hiHatClosed, hiHatOpen, snare, ride ] = drumSetArr

      const drumSet = {
        bassDrum: bassDrum,
        hiHatClosed: hiHatClosed,
        hiHatOpen: hiHatOpen,
        snare: snare,
        ride: ride
      }

      this.setState({ drumSet: drumSet, drumSetArr: drumSetArr })
    }).catch(err => {
      console.log('err', err)
    })
  }

  /**
   * Plays the given drum beat loopCount times
   * 
   * @param  {Array}  drumBeat  [array of notes representing a measure of a drum beat]
   * @param  {Number} timeOut   [intermediate configuration number for timing intervals]
   * @param  {Number} loopCount [number of times to repeat this measure]
   */
  playDrumBeat(drumBeat, timeOut, loopCount) {
    const { drumSetArr } = this.state
    if (!drumSetArr) return

    // call playMeasure immediately at first 
    // since code inside setTnterval starts with the delay (second measure)
    // set loopPlayCount to 1 to account for this
    let loopPlayCount = 1

    playMeasure('drums', drumBeat, timeOut, '', drumSetArr)
    const interval = setInterval(() => {
      if (loopPlayCount === loopCount) {
        clearInterval(interval)
      } else {
        playMeasure('drums', drumBeat, timeOut, '', drumSetArr)
        loopPlayCount++
      }
    }, timeOut * drumBeat.length)
  }

  /**
   * Plays the given midi measure loopCount times
   * 
   * @param  {Array}  measure   [array of notes representing a measure of a midi sequence]
   * @param  {Number} timeOut   [intermediate configuration number for timing intervals]
   * @param  {Number} loopCount [number of times to repeat this measure]
   * @param  {String} waveType  [wave type for Timbre oscillator]
   */
  playMidiTrack(measure, timeOut, loopCount, waveType) {
    
    // call playMeasure immediately at first 
    // since code inside setTnterval starts with the delay (second measure)
    // set loopPlayCount to 1 to account for this
    let loopPlayCount = 1

    const interval = setInterval(() => {
      if (loopPlayCount >= loopCount) {
        clearInterval(interval)
      } else {
        // play only on even measures for now
        if (loopPlayCount % 2) {
          playMeasure('midi', measure, timeOut, waveType)
        }
        loopPlayCount++
      }
    }, timeOut * measure.length)
  }

  /**
   * Plays the given chord progression
   * 
   * @param  {Number} timeOut   [intermediate configuration number for timing intervals]
   * @param  {Number} loopCount [number of times to repeat this measure]
   * @param  {String} waveType  [wave type for Timbre oscillator]
   */
  playChords(timeOut, loopCount, waveType) {
    const chords = [
      sampleMeasures.CHORD_1,
      sampleMeasures.CHORD_2,
      sampleMeasures.CHORD_3,
      sampleMeasures.CHORD_4
    ]

    // call playMeasure immediately at first 
    // since code inside setTnterval starts with the delay (second measure)
    // set loopPlayCount to 1 to account for this
    let loopPlayCount = 1

    playMeasure('midi', chords[loopPlayCount-1], timeOut, waveType)
    const interval = setInterval(() => {
      if (loopPlayCount >= loopCount) {
        clearInterval(interval)
      } else {
        loopPlayCount++
        playMeasure('midi', chords[loopPlayCount-1], timeOut, waveType)
      }
    }, timeOut * sampleMeasures.LEAD.length)
  }

  /**
   * Plays all the channels (drums, lead, chords)
   * 
   * @param  {Number} tempo     [beats per minute (bpm) of song to be played]
   * @param  {Number} loopCount [number of measures to play]
   */
  playAllChannels(tempo, loopCount) {
    tempo = 180
    loopCount = 4
    const timeOut = 60/tempo * 1000

    this.playDrumBeat(sampleMeasures.DRUMS, timeOut, loopCount)
    this.playMidiTrack(sampleMeasures.LEAD, timeOut, loopCount, 'tri')
    this.playChords(timeOut, loopCount, 'sin')
  }

  render() {
    return (
      <div>
        <div className="row"></div>
        <div className="row">
          <button className="btn" onClick={this.playAllChannels}>Play</button>
        </div>
        <Timeline />
      </div>
    )
  }
}

/**
 * Plays a measure of a given midi sequence
 * Handles setting timeouts/intervals with the help of the timeOut param
 * 
 * @param  {String} measureType  [specificies whether the measure is drums or midi]
 * @param  {Array}  measure      [array of notes representing a measure of a midi sequence]
 * @param  {Number} timeOut      [intermediate configuration number for timing intervals]
 * @param  {String} waveType     [wave type for Timbre oscillator]
 * @param  {Array}  drumSet      [reference to drumset sounds in case measureType is drums]
 */
function playMeasure(measureType, measure, timeOut, waveType, drumSet) {
  console.log(measureType, 'measure', measure)

  measure.forEach((count, index) => {
    // count refers to the current eighth note in the measure, 
    // aka the offset from the beginning of the measure
    setTimeout(() => {
      if (count[0].length) {
        for (let notes of count) {
          const [ note, velocity, noteLength ] = notes

          if (measureType === 'drums') {
            drumSet[note].bang()
          } else if (measureType === 'midi') {
            playMidiNote(waveType, note, velocity, noteLength, timeOut)
          }
        }
      }
    }, index * timeOut)
  })
}

/**
 * Plays a midi note using a Timbre oscillator
 * 
 * @param  {String} waveType       [wave type for Timbre oscillator]
 * @param  {Number} midiNoteNumber [number of midi note representing its pitch]
 * @param  {Number} velocity       [Intensity of note (loudness)]
 * @param  {Number} duration       [the length of the note (in standard musical terms)]
 * @param  {Number} timeOut        [intermediate configuration number for timing intervals]
 */
function playMidiNote(waveType, midiNoteNumber, velocity, duration, timeOut) {
  let freq = convertMidiToFreq(midiNoteNumber)

  // temporary hack because notes were an octave too low 
  // and I don't want to manually change every note
  freq = freq *= 2

  const note = T('osc', { wave: waveType, freq: freq, mul: velocity/100 })

  // convert the note's musical duration to the timeout/interval duration
  duration = timeOut * duration * 2

  // unlike the drumset audio which requires a 'bang()',
  // Timbre oscillators need to be started and stopped
  note.play()
  setTimeout(() => {
    note.pause()
  }, duration)
}
