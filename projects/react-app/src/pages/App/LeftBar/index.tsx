import {memo, useCallback, useMemo, useRef, useState} from 'react'
import {DraggableCore, DraggableData} from '@mco/ui'
import styles from './index.module.scss'
import Content from './Content'

const MINWIDTH = 60
const NORWIDTH = 273
const MAXWIDTH = 420

const LeftBar = memo(function LeftBar() {
  const [width, setWidth] = useState(NORWIDTH)
  const [minisize, setMinisize] = useState(false)

  const slackW = useRef(0)

  const resetData = useCallback(() => {
    slackW.current = 0
  }, [])

  const runConstraints = useCallback((w: number) => {
    const oldW = w
    w += slackW.current
    w = Math.max(NORWIDTH, w)
    w = Math.min(MAXWIDTH, w)
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
      left: `${minisize ? MINWIDTH - width : 0}px`,
      width: `${width}px`,
    }
  }, [width, minisize])

  return (
    <div className={styles.leftBar} style={style}>
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
