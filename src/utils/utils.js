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

function randomRange(min, max) {
  return Math.random() * (max - min) + min
}

/**
 * Returns a random integer between min and max, both inclusive
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sum(arr) {
  return arr.reduce((acc, curr) => acc + curr)
}

function last(arr) {
  return arr[arr.length - 1]
}

// assumes probabilities are normalized
function selectWithProbability(options, probabilities) {
  if (options.length !== probabilities.length) {
    throw 'options and probabilities don\'t have the same length'
  }
  const rand = Math.random()
  let weight_sum = 0
  for (let i of range(0, options.length)) {
    weight_sum += probabilities[i]
    if (rand <= weight_sum) return options[i]
  }
}

function set(arr) {
  return [...new Set(arr)]
}

function setUnion(setA, setB) {
  if (Array.isArray(setA)) setA = new Set(setA)
  if (Array.isArray(setB)) setB = new Set(setB)
  return new Set([...setA, ...setB])
}

function setIntersection(setA, setB) {
  if (Array.isArray(setA)) setA = new Set(setA)
  if (Array.isArray(setB)) setB = new Set(setB)
  return new Set([...setA].filter(el => setB.has(el)))
}

function setDifference(setA, setB) {
  if (Array.isArray(setA)) setA = new Set(setA)
  if (Array.isArray(setB)) setB = new Set(setB)
  return new Set([...setA].filter(el => !setB.has(el)))
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