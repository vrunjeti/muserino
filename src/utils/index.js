import { BASS_DRUM_NUMBER, HI_HAT_CLOSED_NUMBER, HI_HAT_OPEN_NUMBER, SNARE_DRUM_NUMBER, RIDE_NUMBER } from './museConstants'
import MuseGen from './muse'
import sampleMeasures from './sampleMeasures'
import utils from './utils'

const drumConstants = {
  BASS_DRUM_NUMBER: BASS_DRUM_NUMBER,
  HI_HAT_CLOSED_NUMBER: HI_HAT_CLOSED_NUMBER,
  HI_HAT_OPEN_NUMBER: HI_HAT_OPEN_NUMBER,
  SNARE_DRUM_NUMBER: SNARE_DRUM_NUMBER,
  RIDE_NUMBER: RIDE_NUMBER
}

export { drumConstants, MuseGen, sampleMeasures, utils }