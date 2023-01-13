import {memo, useCallback, useRef} from 'react'
import VAPlayer, {VAPlayerHandler} from 'src/components/VAPlayer/VAPlayer'
import DrapArea from './DrapArea'
import styles from './index.module.scss'

const VAPView = memo(function VAPView() {
  const handlerRef = useRef<VAPlayerHandler>(null)

  const onDrapped = useCallback(
    (url: string) => {
      handlerRef.current?.play({src: url, loop: true})
    },
    [handlerRef.current],
  )

  return (
    <DrapArea className={styles.view} onDrapped={onDrapped}>
      <VAPlayer className={styles.vap} handlerRef={handlerRef} />
    </DrapArea>
  )
})

export default VAPView
