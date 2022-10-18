import {memo, useCallback, useRef} from 'react'
import ReactMP4AP, {MP4APHandler} from 'src/components/MP4AP/ReactMP4AP'
import DrapView from './DrapArea'
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
    <DrapView className="mp4View" onDrapped={onDrapped}>
      <ReactMP4AP className="render" handlerRef={handlerRef} />
    </DrapView>
  )
})

export default MP4View
