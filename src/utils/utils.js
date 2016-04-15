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

export default { range, convertMidiToFreq }