import React from 'react'
import { render } from 'react-dom'

export default class Timeline extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <div className="row"></div>
        <Times timeInterval={2} />
        {
          channelData.map((channel, i) => {
            const { instrument, playedMeasures, color } = channel
            return (
              <div className="row channel" key={'channel' + i}>
                <div className="col s2">{ `Channel ${i+1} (${instrument})` }</div>
                <div className="col s10 grid-container">
                  <GridRow 
                    numMeasures={4}
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
            key={i}>
          </div>
        })
      }
    </div>
  )
}

const Times = ({ timeInterval }) => {
  return (
    <div className="row times">
      <div className="col s2">Time</div>
      <div className="col s10">
      {
        range(0, 4).map(n => n * timeInterval).map((n, i) => {
          {/* TODO: format time to actual time, take in props of tempo to calculate */}
          return <div className="grid-cell" key={'time' + i}>Time: {n}</div>
        })
      }
      </div>
    </div>
  )
}

const channelData = [
  { instrument: 'drums', playedMeasures: [true, true, true, true], color: '#C3DDE6' },
  { instrument: 'lead', playedMeasures: [false, true, false, true], color: '#DEC3E6' },
  { instrument: 'chords', playedMeasures: [true, true, true, true], color: '#CBE6C3' },
  { instrument: 'bass', playedMeasures: [false, true, true, true], color: '#E6CCC3' }
]

/**
 * Returns an array with integers between start and end
 * @param  {Number} start [beginning of range]
 * @param  {Number} end   [ending of range, non inclusive]
 * @return {Array}        [array of integers from start to end]
 */
function range(start, end) {
  return Array.apply(0, Array(end)).map((element, index) => index + start)
}