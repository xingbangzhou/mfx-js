import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {DraggableCore, DraggableData} from 'src/components/Layouts'
import styles from './index.module.scss'

const MINWIDTH = 240
const MAXWIDTH = 240

const LeftBar = memo(function LeftBar() {
  const [width, setWidth] = useState(MINWIDTH)
  // const [maximize, setMaximize]

  const rootRef = useRef<HTMLDivElement>(null)
  const slackWidth = useRef(0)

  const resetData = useCallback(() => {
    slackWidth.current = 0
  }, [])

  const runConstraints = useCallback((w: number) => {
    const oldW = w
    w += slackWidth.current
    w = Math.max(MINWIDTH, w)
    w = Math.min(MAXWIDTH, w)
    slackWidth.current = slackWidth.current + oldW - w
    return w
  }, [])

  const onResize = useCallback(
    (ev: MouseEvent, {deltaX}: DraggableData) => {
      let newWidth = width + deltaX
      newWidth = runConstraints(newWidth)
      if (newWidth !== width) {
        setWidth(newWidth)
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

  useEffect(() => {
    if (!rootRef.current) return
    const siblingEl = rootRef.current.nextElementSibling as HTMLDivElement | null
    if (siblingEl) {
      Object.assign(siblingEl.style, {
        minWidth: `calc(100% - ${width}px)`,
        maxWidth: `calc(100% - ${width}px)`,
      })
    }
  }, [width])

  const rootStyle = useMemo(() => {
    return {
      width: `${width}px`,
    }
  }, [width])

  return (
    <div ref={rootRef} className={styles.leftBar} style={rootStyle}>
      <DraggableCore onStop={onResizeStop} onStart={onResizeStart} onDrag={onResize}>
        <span className={styles.resizer} />
      </DraggableCore>
    </div>
  )
})

export default LeftBar
