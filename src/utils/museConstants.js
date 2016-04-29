export const BASS_DRUM_NUMBER = 0
export const HI_HAT_CLOSED_NUMBER = 1
export const HI_HAT_OPEN_NUMBER = 2
export const SNARE_DRUM_NUMBER = 3
export const RIDE_NUMBER = 4

export const GHOST_NOTE_PENALTY = 1


// Standard notes in an octave
export const KEYS_IN_OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// For remapping certain note values to more standard note names:
export const NOTE_REMAP = {
  'Db': 'C#',
  'Eb': 'D#',
  'E#': 'F',
  'Fb': 'E',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#',
  'B#': 'C',
  'Cb': 'B'
}

// Relative positions of notes in major/minor scales (e.g. any major scale goes
// base note, whole step, whole step, half step, whole step, whole step, whole
// step, half step)
export const MAJOR_SCALE_PROGRESSION = [0, 2, 4, 5, 7, 9, 11, 12]
export const MINOR_SCALE_PROGRESSION = [0, 2, 3, 5, 7, 8, 10, 12]

// Valid chords that can be transitioned to from some given diatonic triad.
// Taken from http://www.angelfire.com/music/HarpOn/theory2.html
export const TRANSITIONS_MAJOR = {
  'I': ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii0'],
  'ii': ['V', 'vii0'],
  'iii': ['IV', 'vi'],
  'IV': ['I', 'ii', 'V', 'vii0'],
  'V': ['I', 'vi'],
  'vi': ['ii', 'IV', 'V'],
  'vii0': ['I']
}
export const TRANSITIONS_MINOR = {
  'i': ['i', 'ii0', 'III', 'iv', 'V', 'VI', 'VII', 'vii0'],
  'ii0': ['V', 'vii0'],
  'III': ['iv', 'VI'],
  'iv': ['i', 'ii0', 'V', 'vii0'],
  'V': ['i', 'VI'],
  'VI': ['ii0', 'iv', 'V'],
  'VII': ['III'],
  'vii0': ['i', 'V']
}

// Defines the MIDI numbers (in relation to the base note) for diatonic triads.
// These can be combined with the base note to produce chords with MIDI. For
// example, the I chord with base note middle C (60) could be produced with the
// MIDI note numbers [60+0, 60+4, 60+7]
export const TRIAD_NOTES = {
  'I': [0, 4, 7],
  'II': [2, 6, 9],
  'III': [4, 8, 11],
  'IV': [5, 9, 12],
  'V': [7, 11, 14],
  'VI': [9, 13, 16],
  'VII': [11, 15, 18],
  'ii0': [1, 4, 7, 9],
  'vii0': [0, 4, 7, 10]
}
TRIAD_NOTES['i'] = major_chord_to_minor('I')
TRIAD_NOTES['ii'] = major_chord_to_minor('II')
TRIAD_NOTES['iii'] = major_chord_to_minor('III')
TRIAD_NOTES['iv'] = major_chord_to_minor('IV')
TRIAD_NOTES['v'] = major_chord_to_minor('V')
TRIAD_NOTES['vi'] = major_chord_to_minor('VI')
TRIAD_NOTES['vii'] = major_chord_to_minor('VII')

// Produces the MIDI numbers (in relation to the base note) for a minor
// diatonic triad given the major chord symbol (e.g. major_chord_to_minor('I')
// gives the minor sequence [0, 3, 7])
function major_chord_to_minor(symbol) {
  let minor = TRIAD_NOTES[symbol]
  minor[1] -= 1
  return minor
}