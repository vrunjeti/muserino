import {
  BASS_DRUM_NUMBER,
  HI_HAT_CLOSED_NUMBER,
  HI_HAT_OPEN_NUMBER,
  SNARE_DRUM_NUMBER,
  RIDE_NUMBER,
  GHOST_NOTE_PENALTY,
  KEYS_IN_OCTAVE,
  NOTE_REMAP,
  MAJOR_SCALE_PROGRESSION,
  MINOR_SCALE_PROGRESSION,
  TRANSITIONS_MAJOR,
  TRANSITIONS_MINOR,
  TRIAD_NOTES
} from './museConstants'
import U from './utils'

const { range, getRandomInt, last, sum, setDifference, selectWithProbability } = U

// Returns the MIDI note number for a given note name (e.g. "C#4")
function note_number(input_note) {
  try {
    // only capitalize the first letter since otherwise
    // 'b' for flats will be capitalized and won't match regex
    input_note = input_note[0].toUpperCase() + input_note.slice(1)
    let [_, note, octave] = input_note.match(/^([A-Z][b#]?)(\d+)$/)

    if (Object.keys(NOTE_REMAP).includes(note)) {
      note = NOTE_REMAP[note]
    }

    const position_in_octave = KEYS_IN_OCTAVE.indexOf(note)
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
  const scale = major ? MAJOR_SCALE_PROGRESSION : MINOR_SCALE_PROGRESSION
  const base_note = note_number(name + octave)
  return scale.map(note => base_note + note)
}

// Generates a list of MIDI note numbers representing a diatonic triad chord
// given the roman numeral symbol and a base note (e.g. get_chord('I', 60)
// will return [60, 64, 67] which is the first diatonic triad in C major
// starting at middle C).
function get_chord(symbol, base_note) {
  const triad = TRIAD_NOTES[symbol]
  return range(0, triad.length).map(i => triad[i] + base_note)
}

// Given a current chord and a graph with valid transitions (see
// TRANSITIONS_MAJOR or TRANSITIONS_MINOR), picks the next chord in a
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
  const transitions = major ? TRANSITIONS_MAJOR : TRANSITIONS_MINOR
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

        let note_vals_prob = possible_note_vals.filter(([x, p]) => time_used + p <= progression.length).map(([x, p]) => p)

        // normalize probability
        note_vals_prob = note_vals_prob.map(p => p * 1/sum(note_vals_prob))

        // choose a note length
        const note_val = selectWithProbability(possible_note_vals, note_vals_prob)[0]
        console.log('note_val', note_val)


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

        const merppp = Math.floor((note_val/0.125) - 1)
        console.log('note_val', note_val)
        console.log(merppp)
        for (let _ of range(0, merppp)) {
          out.push([])
        }

        time_used += note_val
      }
    })
  }
  return out
}

function make_chords(progression, key) {
  let chords = []
  for (let _ of range(0, 4)) {
    for (let chord of progression) {
      chords.push([get_chord(chord, note_number(key + '2')), 80, 1])
      chords.push(...Array(7).fill([]))
    }
  }
  return chords
}

function make_rhythm_chords(progression, key) {
  let rhythm_chords = []
  for (let _ of range(0, 4)) {
    for (let chord of progression) {
      const note = [get_chord(chord, note_number(key + '2')), 80, 0.125]
      rhythm_chords.push(...Array(8).fill(note))
    }
  }
  return rhythm_chords
}

function make_arpeggio(progression, key) {
  let arpeggio = []
  for (let _ of range(0, 4)) {
    for (let chord of progression) {
      const chord_notes = get_chord(chord, note_number(key + '2'))
      const it = chord_notes.length === 3 ? chord_notes.concat(chord_notes[1]) : chord_notes
      for (let note of it) {
        arpeggio.push([note, 80, 0.25])
        arpeggio.push([])
      }
    }
  }
  return arpeggio
}

function make_snare_line() {
  let snare = range(0, 8).map(_ => {
    if (Math.floor(getRandomInt(0, GHOST_NOTE_PENALTY) * 1/GHOST_NOTE_PENALTY)) {
      return getRandomInt(20, 50)
    } else {
      return 0
    }
  })

  // backbeat
  snare[2] = 60
  snare[6] = 60
  return snare
}

function make_bass_line() {
  let bass = range(0, 8).map(i => {
    const rand = Math.floor(getRandomInt(0, 2 * GHOST_NOTE_PENALTY)/(2 * GHOST_NOTE_PENALTY))
    if (rand && !range(2, 6).includes(i)) {
      return getRandomInt(30, 80)
    } else {
      return 0
    }
  })
  return bass
}

function make_drums(type, line) {
  let drums = []
  for (let _ of range(0, 16)) {
    const drum_number = type === 'snare' ? SNARE_DRUM_NUMBER : BASS_DRUM_NUMBER
    const measure = drums.map(hit => hit ? [drum_number, hit, 0.03] : [])
    drums.push(...measure)
  }
  return drums
}

function make_hihat() {
  let hihat = []
  if (getRandomInt(0, 1)) {
    for (let _ of range(0, 64)) {
      const hits = [[HI_HAT_CLOSED_NUMBER, 70, 0.3], [HI_HAT_CLOSED_NUMBER, 40, 0.3]]
      hihat.push(...hits)
    }
  } else {
    for (let _ of range(0, 128)) {
      hihat.push([])
    }
  }
  return hihat
}

function generate_section(type, key, bars=4, major=true, seed) {
  const progression = generate_progression(4, major)

  const chords = make_chords(progression, key)
  const rhythm_chords = make_rhythm_chords(progression, key)
  const arpeggio = make_arpeggio(progression, key)

  const snare = make_drums('snare', make_snare_line())
  const bass = make_drums('bass', make_bass_line())
  const hihat = make_hihat()

  // either 2 or 4
  let melody_repeats = getRandomInt(0, 1) === 0 ? 2 : 4

  let melody = generate_melody(key, progression, melody_repeats, major)
  if (melody_repeats === 2) {
    melody.push(...melody)
  }

  let packaged_section = {
    chords: chords,
    arpeggio: arpeggio,
    snare: snare,
    bass: bass,
    hihat: hihat,
    melody: melody
  }

  if (type === 'verse') {
    packaged_section.rhythm_chords = rhythm_chords
  }

  return packaged_section
}

function generate(tempo=120, major=true, swing=false) {
  const key = KEYS_IN_OCTAVE[getRandomInt(0, KEYS_IN_OCTAVE.length - 1)]
  const verse = generate_section('verse', key, 4, major)
  const chorus = generate_section('chorus', key, 4, major, last(verse.verse_progression))
  return {
    verse: verse,
    chorus: chorus
  }
}

export default {
  get_chord,
  note_number,
  generate_progression,
  generate
}
