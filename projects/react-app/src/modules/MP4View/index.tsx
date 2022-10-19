import {memo, useCallback, useRef} from 'react'
import MP4AP, {MP4APHandler} from 'src/components/MP4AP/MP4AP'
import DrapArea from './DrapArea'
import './index.scss'

const MP4View = memo(function MP4View() {
  const handlerRef = useRef<MP4APHandler>(null)

  const onDrapped = useCallback(
    (url: string) => {
      handlerRef.current?.play({src: url, loop: true})
    },
    [handlerRef.current],
  )

  return (
    <DrapArea className="mp4View" onDrapped={onDrapped}>
      <MP4AP className="mp4ap" handlerRef={handlerRef} />
    </DrapArea>
  )
})

export default MP4View
