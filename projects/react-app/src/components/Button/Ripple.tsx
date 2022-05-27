import styled from '@emotion/styled'
import {CSSProperties, memo, useCallback, useRef} from 'react'

const RippleWrapper = styled.span`
  position: absolute;
  display: inline-block;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`

const RippleInner = styled.span`
  position: absolute;
  display: inline-block;
  border-radius: 50%;
  pointer-events: none;
  transform: scale(0);

  &.start {
    transform: scale(0.2);
  }

  &.active {
    transform: scale(2);
    transition: transform 800ms, opacity 800ms;
    opacity: 0.2;
  }
`

interface RippleProps {
  className?: string
  style?: CSSProperties
  color?: React.CSSProperties['backgroundColor']
}

const Ripple = memo(function Ripple(props: RippleProps) {
  const {className, style, color = '#90909099'} = props
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
    ripple.classList.remove('active')

    timerId.current = window.setTimeout(() => {
      ripple.classList.add('start')
      timerId.current = window.setTimeout(() => {
        timerId.current = undefined
        ripple.classList.add('active')
      })
    })
  }, [])

  const onMouseUp = useCallback(() => {
    timerId.current && window.clearTimeout(timerId.current)
    timerId.current = window.setTimeout(() => {
      timerId.current = undefined
      const ripple = nodeRef.current?.firstChild as HTMLSpanElement | undefined
      ripple?.classList.remove('active', 'start')
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
    <RippleWrapper ref={onRef} className={className} style={style}>
      <RippleInner style={{backgroundColor: color}} />
    </RippleWrapper>
  )
})

export default Ripple
