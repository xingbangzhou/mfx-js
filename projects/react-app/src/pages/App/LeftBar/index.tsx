import {CSSProperties, memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {DraggableCore, DraggableData} from '@mco/ui'
import styles from './index.module.scss'

const MINWIDTH = 273
const MAXWIDTH = 420

const LeftBar = memo(function LeftBar() {
  const [width, setWidth] = useState(MINWIDTH)
  const [maxisize, setMaxisize] = useState(true)

  const rootRef = useRef<HTMLDivElement>(null)
  const slackW = useRef(0)

  const resetData = useCallback(() => {
    slackW.current = 0
  }, [])

  const runConstraints = useCallback((w: number) => {
    const oldW = w
    w += slackW.current
    w = Math.max(MINWIDTH, w)
    w = Math.min(MAXWIDTH, w)
    slackW.current = slackW.current + oldW - w
    return w
  }, [])

  const onResize = useCallback(
    (ev: MouseEvent, {deltaX}: DraggableData) => {
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
      setMaxisize(!maxisize)
    },
    [maxisize],
  )

  const style = useMemo(() => {
    return {
      position: 'absolute',
      left: `${maxisize ? 0 : -width}px`,
      top: '0px',
      zIndex: 10,
      width: `${width}px`,
    } as CSSProperties
  }, [width, maxisize])

  useEffect(() => {
    if (!rootRef.current) return
    const siblingEl = rootRef.current.nextElementSibling as HTMLDivElement | null
    if (siblingEl) {
      const w = 0
      Object.assign(siblingEl.style, {
        minWidth: `calc(100% - ${w}px)`,
        maxWidth: `calc(100% - ${w}px)`,
      })
    }
  }, [width])

  return (
    <div ref={rootRef} className={styles.leftBar} style={style}>
      <div className={styles.content}></div>
      <DraggableCore onStop={onResizeStop} onStart={onResizeStart} onDrag={onResize}>
        <span className={styles.dragHandler}></span>
      </DraggableCore>
      <div className={maxisize ? styles.maximize : styles.minimize}>
        <div className={styles.handle} onClick={onMaxminized} />
      </div>
    </div>
  )
})

export default LeftBar
