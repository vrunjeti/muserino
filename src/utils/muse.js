import U from './utils'

const { range, getRandomInt, last, sum, setDifference, selectWithProbability } = U

 const BASS_DRUM_NUMBER = 0
 const HI_HAT_CLOSED_NUMBER = 1
 const HI_HAT_OPEN_NUMBER = 2
 const SNARE_DRUM_NUMBER = 3
 const RIDE_NUMBER = 4

// Standard notes in an octave
const keys_in_octave = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// For remapping certain note values to more standard note names:
const note_remap = {
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
const major_scale_progression = [0, 2, 4, 5, 7, 9, 11, 12]
const minor_scale_progression = [0, 2, 3, 5, 7, 8, 10, 12]

// Valid chords that can be transitioned to from some given diatonic triad.
// Taken from http://www.angelfire.com/music/HarpOn/theory2.html
const transitions_major = {
  'I': ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii0'],
  'ii': ['V', 'vii0'],
  'iii': ['IV', 'vi'],
  'IV': ['I', 'ii', 'V', 'vii0'],
  'V': ['I', 'vi'],
  'vi': ['ii', 'IV', 'V'],
  'vii0': ['I']
}
const transitions_minor = {
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
const triad_notes = {
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
triad_notes['i'] = major_chord_to_minor('I')
triad_notes['ii'] = major_chord_to_minor('II')
triad_notes['iii'] = major_chord_to_minor('III')
triad_notes['iv'] = major_chord_to_minor('IV')
triad_notes['v'] = major_chord_to_minor('V')
triad_notes['vi'] = major_chord_to_minor('VI')
triad_notes['vii'] = major_chord_to_minor('VII')

// Produces the MIDI numbers (in relation to the base note) for a minor
// diatonic triad given the major chord symbol (e.g. major_chord_to_minor('I')
// gives the minor sequence [0, 3, 7])
function major_chord_to_minor(symbol) {
  let minor = triad_notes[symbol]
  minor[1] -= 1
  return minor
}

// Returns the MIDI note number for a given note name (e.g. "C#4")
function note_number(input_note) {
  try {
    // only capitalize the first letter since otherwise
    // 'b' for flats will be capitalized and won't match regex
    input_note = input_note[0].toUpperCase() + input_note.slice(1)
    let [_, note, octave] = input_note.match(/^([A-Z][b#]?)(\d+)$/)

    if (Object.keys(note_remap).includes(note)) {
      note = note_remap[note]
    }

    const position_in_octave = keys_in_octave.indexOf(note)
    return (Math.floor(octave) + 2) * 12 + position_in_octave
  }
  catch (e) {
    console.log(`Bad note input to note_number ${input_note}`)
  }
}

// Generates a sequence of MIDI note numbers for a scale (do re mi fa sol la
// si do). `name` specifies the base note, `octave` specifies in which octave
// the scale should be, and `major` designates whether the produced scale
// should be major or minor.
function generate_scale(name, octave, major=true) {
  const scale = major ? major_scale_progression : minor_scale_progression
  const base_note = note_number(name + octave)
  return scale.map(note => base_note + note)
}

// Generates a list of MIDI note numbers representing a diatonic triad chord
// given the roman numeral symbol and a base note (e.g. get_chord('I', 60)
// will return [60, 64, 67] which is the first diatonic triad in C major
// starting at middle C).
function get_chord(symbol, base_note) {
  const triad = triad_notes[symbol]
  return range(0, triad.length).map(i => triad[i] + base_note)
}

// Given a current chord and a graph with valid transitions (see
// transitions_major or transitions_minor), picks the next chord in a
// progression
function pick_next_chord(seed, transitions) {
  return transitions[seed][getRandomInt(0, transitions[seed].length - 1)]
}

// Generates an n-bar chord progression. Returns a list of roman numerals
// representing the chords (for any key). `major` specifies whether a major
// key is being used. If `seed` is provided, the progression will be
// generated such that `seed` transitions to the first chord of the
// progression; otherwise, a random first chord will be chosen.
function generate_progression(bars, major=true, seed) {
  const transitions = major ? transitions_major : transitions_minor
  const randIndex = getRandomInt(0, Object.keys(transitions).length - 1)
  let progression = []
  progression[0] = seed ? pick_next_chord(seed, transitions) : Object.keys(transitions)[randIndex]
  for (let _ of range(0, bars - 1)) {
    progression.push(pick_next_chord(last(progression), transitions))
  }
  return progression
}

// Generates a {len(progression)*progression_repeats}-bar melody given a key,
// chord progression, and whether or not the key is a major key.
function generate_melody(key, progression, progression_repeats, major=true) {
  let out = []
  for (let _ of range(0, progression_repeats)) {
    // Number of measures that have been generated so far
    let time_used = 0
    progression.forEach((chord, i) => {
      const all_tones = generate_scale(key, 2, major)

      let chord_tones = get_chord(chord, note_number(key + '2'))
      chord_tones = chord_tones.concat(chord_tones.map(tone => tone + 12))

      let non_chord_tones = [...setDifference(all_tones.slice(0, -1), chord_tones)]
      non_chord_tones = non_chord_tones.concat(non_chord_tones.map(tone => tone + 12))

      let last_played

      // Generate a sequence of notes to fill a measure for this chord
      while (time_used < i + 1) {
        // list of [note length, note's relative probability] pairs
        const note_vals = [[0.125, 2], [0.25, 4], [0.375, 2], [0.5, 2], [0.75, 1], [1.0, 1], [1.25, 0.5], [1.5, 0.25]]

        // Only allow note lengths that will fit into the len(progression)
        // measures for this chord progression (i.e. don't allow spill
        // of notes into different repetitions of the progression)
        const possible_note_vals = note_vals.filter(([x, p]) => time_used + x <= progression.length)

        let note_vals_prob = note_vals.filter(([x, p]) => time_used + p <= progression.length)

        // normalize probability
        note_vals_prob = note_vals_prob.map(p => p * 1/sum(note_vals_prob))

        // choose a note length
        const note_val = selectWithProbability(possible_note_vals, note_vals_prob)

        // Choose the set of note numbers we could pick from (either
        // the chord tones or non-chord tones)
        const select_from = Math.random() < 0.5 ? chord_tones : non_chord_tones

        // Incentivize choosing notes that are close to the previously
        // played note so that we aren't just jumping all over the
        // place and sounding terribly random
        const NEARBY_INCENTIVE = 2
        let select_from_probabilites = select_from.filter(tone => {
          return last_played ? (36 - Math.pow(Math.abs(last_played - tone), 2)) : 1
        })

        // normalize select_from_probabilites probabilites
        select_from_probabilites = select_from_probabilites.map(p => p * 1/sum(select_from_probabilites))

        out.push([
          selectWithProbability(select_from, select_from_probabilites),
          80,
          note_val
        ])
        last_played = last(out)[0]

        // out = out.concat(range(0, Math.floor((note_val/0.125) - 1)).map(i => []))
        for (let _ of range(0, Math.floor((note_val/0.125) - 1))) {
          out.push([])
        }

        time_used += note_val
      }
    })
  }
  return out
}

function generate(tempo, major=true, swing=false) {
  tempo = getRandomInt(100, 200)
  const seconds_per_beat = 60/tempo
  const key = keys_in_octave[getRandomInt(0, keys_in_octave.length - 1)]

  // create verse
  const verse_progression = generate_progression(4, major)

  let verse_chords = []
  for (let _ of range(0, 4)) {
    for (let chord of verse_progression) {
      verse_chords.push([get_chord(chord, note_number(key + '2')), 80, 1])
      verse_chords = verse_chords.concat(range(0, 7).map(_ => []))
      // verse_chords = verse_chords.concat(Array(7).fill([]))
      // verse_chords.push(...(range(0, 7).map(_ => [])))
      // verse_chords.push(...Array(7).fill([]))
    }
  }

  let verse_rhythm_chords = []
  for (let _ of range(0, 4)) {
    for (let chord of verse_progression) {
      const note = [get_chord(chord, note_number(key + '2')), 80, 0.125]
      verse_rhythm_chords = verse_rhythm_chords.concat(Array(8).fill(note))
    }
  }

  let verse_arp = []
  for (let _ of range(0, 4)) {
    for (let chord of verse_progression) {
      const chord_notes = get_chord(chord, note_number(key + '2'))
      const it = chord_notes.length === 3 ? chord_notes.concat(chord_notes[1]) : chord_notes
      for (let note of it) {
        verse_arp.push([note, 80, 0.25])
        verse_arp.push([])
      }
    }
  }

  const ghost_note_penalty = 1
  let snare = range(0, 8).map(_ => {
    if (Math.floor(getRandomInt(0, ghost_note_penalty) * 1/ghost_note_penalty)) {
      return getRandomInt(20, 50)
    } else {
      return 0
    }
  })
  // backbeat
  snare[2] = 60
  snare[6] = 60

  let bass = range(0, 8).map(i => {
    const rand = Math.floor(getRandomInt(0, 2 * ghost_note_penalty)/(2 * ghost_note_penalty))
    if (rand && !range(2, 6).includes(i)) {
      return getRandomInt(30, 80)
    } else {
      return 0
    }
  })

  let verse_snare = []
  for (let _ of range(0, 16)) {
    const measure = snare.map(hit => hit ? [SNARE_DRUM_NUMBER, hit, 0.03] : [])
    verse_snare.push(...measure)
  }

  let verse_bass = []
  for (let _ of range(0, 16)) {
    const measure = bass.map(hit => hit ? [BASS_DRUM_NUMBER, hit, 0.03] : [])
    verse_bass.push(...measure)
  }

  let verse_hihat = []
  if (getRandomInt(0, 1)) {
    for (let _ of range(0, 64)) {
      const hits = [[HI_HAT_CLOSED_NUMBER, 70, 0.3], [HI_HAT_CLOSED_NUMBER, 40, 0.3]]
      verse_hihat.push(...hits)
    }
  } else {
    for (let _ of range(0, 128)) {
      verse_hihat.push([])
    }
  }

  // either 2 or 4
  let melody_repeats = getRandomInt(0, 1) === 0 ? 2 : 4

  let verse_melody = generate_melody(key, verse_progression, melody_repeats, major)
  if (melody_repeats === 2) {
    verse_melody.push(...verse_melody)
  }


  let chorus_progression = generate_progression(4, major, last(verse_progression))

  let chorus_chords = []
  for (let _ of range(0, 4)) {
    for (let chord of chorus_progression) {
      chorus_chords.push([get_chord(chord, note_number(key + '2')), 80, 1])
      chorus_chords.push(...Array(7).fill([]))
    }
  }

  let chorus_arp = []
  for (let _ of range(0, 4)) {
    for (let chord of chorus_progression) {
      const notes = get_chord(chord, note_number(key + '2'))
      const it = notes.length === 3 ? notes.concat(notes[3]) : notes
      for (let note of it) {
        chorus_arp.push([note, 80, 0.25])
        chorus_arp.push([])
      }
    }
  }

  let c_snare = range(0, 8).map(_ => {
    if (Math.floor(getRandomInt(0, ghost_note_penalty) * 1/ghost_note_penalty)) {
      return getRandomInt(20, 50)
    } else {
      return 0
    }
  })
  // backbeat
  c_snare[2] = 60
  c_snare[6] = 60

  let c_bass = range(0, 8).map(i => {
    const rand = Math.floor(getRandomInt(0, 2 * ghost_note_penalty)/(2 * ghost_note_penalty))
    if (rand && !range(2, 6).includes(i)) {
      return getRandomInt(30, 80)
    } else {
      return 0
    }
  })

  let chorus_snare = []
  for (let _ of range(0, 16)) {
    const measure = c_snare.map(hit => hit ? [SNARE_DRUM_NUMBER, hit, 0.03] : [])
    chorus_snare.push(...measure)
  }

  let chorus_bass = []
  for (let _ of range(0, 16)) {
    const measure = c_bass.map(hit => hit ? [BASS_DRUM_NUMBER, hit, 0.03] : [])
    chorus_bass.push(...measure)
  }

  let chorus_hihat = []
  if (getRandomInt(0, 1)) {
    for (let _ of range(0, 64)) {
      const hits = [[HI_HAT_CLOSED_NUMBER, 70, 0.3], [HI_HAT_CLOSED_NUMBER, 40, 0.3]]
      chorus_hihat.push(...hits)
    }
  } else {
    for (let _ of range(0, 128)) {
      chorus_hihat.push([])
    }
  }

  // either 2 or 4
  let c_melody_repeats = getRandomInt(0, 1) === 0 ? 2 : 4

  let chorus_melody = generate_melody(key, verse_progression, c_melody_repeats, major)
  if (c_melody_repeats === 2) {
    chorus_melody.push(...chorus_melody)
  }

  return {
    verse_chords: verse_chords,
    verse_rhythm_chords: verse_rhythm_chords,
    verse_arp: verse_arp,
    verse_snare: verse_snare,
    verse_bass: verse_bass,
    verse_hihat: verse_hihat,
    verse_melody: verse_melody,
    chorus_chords: chorus_chords,
    chorus_arp: chorus_arp,
    chorus_snare: chorus_snare,
    chorus_bass: chorus_bass,
    chorus_hihat: chorus_hihat,
    chorus_melody: chorus_melody
  }

}

export default {
  get_chord,
  note_number,
  generate_progression,
  generate
}