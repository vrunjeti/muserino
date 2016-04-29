import { setUnion, setIntersection, setDifference } from './set'

/**
 * Returns an array with integers between start and end
 *
 * @param  {Number} start [beginning of range]
 * @param  {Number} end   [ending of range, non inclusive]
 * @return {Array}        [array of integers from start to end]
 */
function range(start, end) {
  return Array.apply(0, Array(end)).map((element, index) => index + start)
}

/**
 * Converts midiNoteNumber to its corresponding frequency
 * https://en.wikipedia.org/wiki/MIDI_Tuning_Standard
 *
 * @param  {Number} midiNoteNumber [number of midi note representing its pitch]
 * @return {Number}                [frequency of note in Hz]
 */
function convertMidiToFreq(midiNoteNumber) {
  const A4 = 440
  return Math.pow(2, (midiNoteNumber - 69)/12) * A4
}

/**
 * Returns a random number between min and max
 */
function randomRange(min, max) {
  return Math.random() * (max - min) + min
}

/**
 * Returns a random integer between min and max, both inclusive
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Calculates the sum of all arguments.
 * This accepts any number of parameters of type Number, or an array of Numbers
 */
function sum(...arr) {
  // if argument is given as an array, keep it as an array
  if (Array.isArray(arr[0])) arr = arr[0]
  return arr.reduce((acc, curr) => acc + curr)
}

/**
 * Returns the last element in an array
 */
function last(arr) {
  return arr[arr.length - 1]
}

// assumes probabilities are normalized
function selectWithProbability(options, probabilities) {
  console.log('options', options)
  console.log('probabilities', probabilities)
  if (options.length !== probabilities.length) {
    console.log('noooooo')
    throw new Error('options and probabilities don\'t have the same length')
  }
  const rand = Math.random()
  let weight_sum = 0
  let ret
  for (let i of range(0, options.length)) {
    weight_sum += probabilities[i]
    if (rand <= weight_sum) {
      console.log('what', options[i])
      ret = options[i]
    }
  }
  console.log('ret', ret)
  return ret
}

export default {
  range,
  convertMidiToFreq,
  getRandomInt,
  sum,
  last,
  setUnion,
  setIntersection,
  setDifference,
  selectWithProbability
}