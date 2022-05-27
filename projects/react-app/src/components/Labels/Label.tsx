import styled from '@emotion/styled'
import {CSSProperties, memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'

export interface LabelProps {
  className?: string
  style?: CSSProperties
  text?: string
  auto?: boolean
}

const LabelWrapper = styled.div`
  overflow: hidden;

  p {
    white-space: nowrap;
    display: inline-block;
  }
`

const Label = memo(function Label(props: LabelProps) {
  const {className, style, text, auto} = props
  const [hover, setHover] = useState(false)
  const [x, setX] = useState(0)

  const boxRef = useRef<HTMLDivElement>()
  const slackX = useRef({orientation: false, x: 0})
  const animationId = useRef<number>()

  const onFrame = useCallback(() => {
    const boxElement = boxRef.current
    if (!boxElement) return
    const textElement = boxElement.firstChild as HTMLParagraphElement
    const boxWidth = boxElement.clientWidth
    const textWidth = textElement.clientWidth
    if (textWidth <= boxWidth) return
    const step = Math.min(1, Math.floor(textWidth - boxWidth) * 0.1)
    const distance = Math.min(Math.abs(slackX.current.x + textWidth - boxWidth), step) || step
    if (slackX.current.orientation) {
      slackX.current.x += distance
    } else {
      slackX.current.x -= distance
    }
    setX(slackX.current.x)
    if (slackX.current.x <= boxWidth - textWidth) {
      slackX.current.orientation = true
    } else if (slackX.current.x >= 0) {
      slackX.current.orientation = false
    }
    animationId.current = window.requestAnimationFrame(onFrame)
  }, [])

  const runAnimation = useCallback(() => {
    if (!animationId.current) {
      animationId.current = window.requestAnimationFrame(onFrame)
    }
  }, [])

  const clear = useCallback(() => {
    animationId.current && window.cancelAnimationFrame(animationId.current)
    animationId.current = undefined
    slackX.current.orientation = false
    slackX.current.x = 0
    setX(0)
  }, [])

  const onMouseOver = useCallback(() => {
    setHover(true)
  }, [])

  const onMouseOut = useCallback(() => {
    setHover(false)
  }, [])

  const onRef = useCallback(
    (element: HTMLDivElement | null) => {
      boxRef.current = element || undefined
      clear()
      if (auto || hover) {
        runAnimation()
      }
    },
    [auto, hover],
  )

  useEffect(() => {
    return () => clear()
  }, [])

  useEffect(() => {
    auto || hover ? runAnimation() : clear()
  }, [auto, hover])

  const textStyle = useMemo(() => {
    return {
      transform: `translateX(${x}px)`,
    }
  }, [x])

  return (
    <LabelWrapper ref={onRef} className={className} style={style} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      <p style={textStyle}>{text}</p>
    </LabelWrapper>
  )
})

export default Label
