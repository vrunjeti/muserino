import React from 'react'
import { render } from 'react-dom'
import { utils } from './../utils'
const { range } = utils

export default class Timeline extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const NUM_MEASURES = 6
    const TIME_INTERVAL = 2

    return (
      <div>
        <div className="row"></div>
        <Times timeInterval={TIME_INTERVAL} numMeasures={NUM_MEASURES} />
        {
          CHANNEL_DATA.map((channel, i) => {
            const { instrument, playedMeasures, color } = channel
            return (
              <div className="row channel" key={'channel' + i}>
                <div className="col s2">{ `Channel ${i+1} (${instrument})` }</div>
                <div className="col s10 grid-container">
                  <GridRow
                    numMeasures={NUM_MEASURES}
                    index={i}
                    playedMeasures={playedMeasures}
                    color={color}
                  />
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }
}

const GridRow = ({ numMeasures, index, playedMeasures, color }) => {
  return (
    <div>
      {
        range(0, numMeasures).map((n, i) => {
          const backgroundColor = playedMeasures[i] ? color : '#fafafa'
          return <div
            className="grid-cell bordered-cell"
            style={{ backgroundColor: backgroundColor}}
            numMeasures={numMeasures}
            key={i}>
          </div>
        })
      }
    </div>
  )
}

const Times = ({ timeInterval, numMeasures }) => {
  return (
    <div className="row times">
      <div className="col s2">Time</div>
      <div className="col s10">
      {
        range(0, numMeasures).map(n => n * timeInterval).map((n, i) => {
          {/* TODO: format time to actual time, take in props of tempo to calculate */}
          return <div className="grid-cell" key={'time' + i}>Time: {n}</div>
        })
      }
      </div>
    </div>
  )
}

/**
 * Dummy data containing temporary attributes of the grid view
 * Will be populated and recalculated by the actual music in the future
 */
const CHANNEL_DATA = [
  { instrument: 'drums', playedMeasures: [true, true, true, true, false, false], color: '#C3DDE6' },
  { instrument: 'lead', playedMeasures: [false, true, false, true, false, false], color: '#DEC3E6' },
  { instrument: 'chords', playedMeasures: [true, true, true, true, false, false], color: '#CBE6C3' },
  { instrument: 'bass', playedMeasures: [false, false, false, false, false, false], color: '#E6CCC3' }
]
