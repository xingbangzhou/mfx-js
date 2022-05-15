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
    const ripple = nodeRef.current
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
    ripple.classList.remove(styles.start)

    timerId.current = window.setTimeout(() => {
      ripple.classList.add('start')
      timerId.current = window.setTimeout(() => {
        ripple.classList.add('active')
      })
    })
  }, [])

  const onMouseUp = useCallback(() => {
    timerId.current && window.clearTimeout(timerId.current)
    timerId.current = window.setTimeout(() => {
      timerId.current = undefined
      nodeRef.current?.classList.remove(styles.active)
      nodeRef.current?.classList.remove(styles.start)
    })
  }, [])

  const onRef = useCallback((el: HTMLSpanElement | null) => {
    clear()
    nodeRef.current = el || undefined
    const parentElement = nodeRef.current?.parentElement
    parentElement?.addEventListener('mousedown', onMouseDown)
    parentElement?.addEventListener('mouseup', onMouseUp)
  }, [])

  return <span ref={onRef} style={{backgroundColor: color}} />
})

export default Ripple
