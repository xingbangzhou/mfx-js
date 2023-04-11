import {memo, useCallback, useMemo, useRef, useState} from 'react'
import {DraggableCore, DraggableData} from '@mfx0/gui'
import styles from './index.module.scss'
import Content from './Content'

const dimensions = {
  minwidth: 60,
  norwidth: 273,
  maxwidth: 820,
}

const LeftBar = memo(function LeftBar() {
  const [width, setWidth] = useState(dimensions.norwidth)
  const [minisize, setMinisize] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const slackW = useRef(0)

  const resetData = useCallback(() => {
    slackW.current = 0
  }, [])

  const runConstraints = useCallback((w: number) => {
    const oldW = w
    w += slackW.current
    w = Math.max(dimensions.norwidth, w)
    w = Math.min(dimensions.maxwidth, w)
    slackW.current = slackW.current + oldW - w
    return w
  }, [])

  const onResize = useCallback(
    (_ev: MouseEvent, {deltaX}: DraggableData) => {
      let newW = width + deltaX
      newW = runConstraints(newW)
      if (newW !== width) {
        setWidth(newW)
      }
    },
    [width],
  )

  const onResizeStop = useCallback(
    (ev: MouseEvent, data: DraggableData) => {
      resetData()
      onResize(ev, data)
    },
    [width],
  )

  const onResizeStart = useCallback(
    (ev: MouseEvent, data: DraggableData) => {
      resetData()
      onResize(ev, data)
    },
    [width],
  )

  const onMaxminized = useCallback(
    (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      ev.stopPropagation()
      setMinisize(!minisize)
    },
    [minisize],
  )

  const style = useMemo(() => {
    return {
      width: `${minisize ? dimensions.minwidth : width}px`,
    }
  }, [width, minisize])

  return (
    <div ref={rootRef} className={styles.leftBar} style={style}>
      <Content />
      <DraggableCore onStop={onResizeStop} onStart={onResizeStart} onDrag={onResize}>
        <span className={styles.draggable} aria-hidden={minisize}></span>
      </DraggableCore>
      <div className={minisize ? styles.minimize : styles.maximize}>
        <div className={styles.handle} onClick={onMaxminized} />
      </div>
    </div>
  )
})

export default LeftBar
