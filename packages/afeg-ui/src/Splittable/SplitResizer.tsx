import React from 'react'
import {SplitType} from './_fns'

interface SplitResizerProps {
  index: number
  split?: SplitType
  onMouseDown(event: React.MouseEvent, index: number): void
}

export default function Resizer(props: SplitResizerProps) {
  const {index, split = 'vertical', onMouseDown} = props

  return (
    <div className={`split-resizer ${split === 'vertical' ? 'split-resizer-v' : 'split-resizer-h'}`}>
      <div onMouseDown={event => onMouseDown(event, index)}></div>
    </div>
  )
}
