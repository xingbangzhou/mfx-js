import React from 'react'
import styles from './index.module.scss'

interface RippleProps {
  color?: React.CSSProperties['backgroundColor']
}

export default function Ripple(props: RippleProps) {
  const rippleRef = React.useRef<HTMLSpanElement>(null)
  const timerRef = React.useRef<number>()

  React.useEffect(function () {
    const onMouseDown = function (event: MouseEvent) {
      window.clearTimeout(timerRef.current)
      timerRef.current = undefined
      const ripple = rippleRef.current as HTMLSpanElement
      const container = ripple.parentElement as HTMLElement
      const size = container.offsetWidth
      const pos = container.getBoundingClientRect()
      const x = event.pageX - pos.left - size
      const y = event.pageY - pos.top - size
      Object.assign(ripple.style, {
        top: y + 'px',
        left: x + 'px',
        width: size * 2 + 'px',
        height: size * 2 + 'px',
      })
      ripple.classList.remove(styles.active)
      ripple.classList.remove(styles.start)

      timerRef.current = window.setTimeout(() => {
        ripple.classList.add('start')
        timerRef.current = window.setTimeout(() => {
          ripple.classList.add('active')
        })
      })
    }

    const onMouseUp = function (event: MouseEvent) {
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        rippleRef.current?.classList.remove(styles.active)
        rippleRef.current?.classList.remove(styles.start)
      })
    }

    const container = rippleRef.current?.parentElement
    if (container) {
      container.addEventListener('mousedown', onMouseDown)
      container.addEventListener('mouseup', onMouseUp)
    }

    return function () {
      window.clearTimeout(timerRef.current)
      const container = rippleRef.current?.parentElement
      if (container) {
        container.removeEventListener('mousedown', onMouseDown)
        container.removeEventListener('mouseup', onMouseUp)
      }
    }
  }, [])

  return <span className={styles.ripple} style={{backgroundColor: props.color}}></span>
}
