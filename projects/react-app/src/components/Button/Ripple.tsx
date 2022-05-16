import React, {memo, useCallback, useRef} from 'react'
import styles from './index.module.scss'

interface RippleProps {
  color?: React.CSSProperties['backgroundColor']
}

const Ripple = memo(function Ripple(props: RippleProps) {
  const {color = '#90909099'} = props
  const nodeRef = useRef<HTMLSpanElement>()
  const timerId = useRef<number>()

  const clear = useCallback(() => {
    timerId.current && window.clearTimeout(timerId.current)
    timerId.current = undefined
    const parentElement = nodeRef.current?.parentElement
    parentElement?.removeEventListener('mousedown', onMouseDown)
    parentElement?.removeEventListener('mouseup', onMouseUp)
  }, [])

  const onMouseDown = useCallback((ev: MouseEvent) => {
    timerId.current && window.clearTimeout(timerId.current)
    timerId.current = undefined
    const ripple = nodeRef.current?.firstChild as HTMLSpanElement | undefined
    if (!ripple) return
    const parentElement = ripple.parentElement!
    const size = parentElement.offsetWidth
    const rect = parentElement.getBoundingClientRect()
    const x = ev.pageX - rect.left - size
    const y = ev.pageY - rect.top - size
    Object.assign(ripple.style, {
      top: y + 'px',
      left: x + 'px',
      width: size * 2 + 'px',
      height: size * 2 + 'px',
    })
    ripple.classList.remove(styles.active)

    timerId.current = window.setTimeout(() => {
      ripple.classList.add(styles.start)
      timerId.current = window.setTimeout(() => {
        timerId.current = undefined
        ripple.classList.add(styles.active)
      })
    })
  }, [])

  const onMouseUp = useCallback(() => {
    timerId.current && window.clearTimeout(timerId.current)
    timerId.current = window.setTimeout(() => {
      timerId.current = undefined
      const ripple = nodeRef.current?.firstChild as HTMLSpanElement | undefined
      ripple?.classList.remove(styles.active, styles.start)
    }, 800)
  }, [])

  const onRef = useCallback((element: HTMLSpanElement | null) => {
    clear()
    nodeRef.current = element || undefined
    const parentElement = nodeRef.current?.parentElement
    parentElement?.addEventListener('mousedown', onMouseDown)
    parentElement?.addEventListener('mouseup', onMouseUp)
  }, [])

  return (
    <span ref={onRef} className={styles.ripple}>
      <span style={{backgroundColor: color}} />
    </span>
  )
})

export default Ripple
