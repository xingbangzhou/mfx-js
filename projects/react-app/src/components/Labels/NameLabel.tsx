import React, {CSSProperties, memo, useCallback, useEffect, useRef, useState} from 'react'
import styles from './index.module.scss'

export interface NameLabelProps {
  className?: string
  style?: CSSProperties
  name?: string
  step?: number
  auto?: boolean
}

const NameLabel = memo(function NameLabel(props: NameLabelProps) {
  const {className, style, name, step = 1, auto} = props
  const [hover, setHover] = useState(false)

  const boxRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLParagraphElement>(null)
  const animateX = useRef({orient: false, x: 0})
  const animHandler = useRef<number>()
  const stepRef = useRef(step)
  stepRef.current = step

  useEffect(() => {
    return () => {
      animHandler.current && window.cancelAnimationFrame(animHandler.current)
    }
  }, [])

  useEffect(() => {
    if (auto || hover) {
      if (!animHandler.current) {
        animHandler.current = window.requestAnimationFrame(onFrame)
      }
    } else {
      animHandler.current && window.cancelAnimationFrame(animHandler.current)
      animHandler.current = undefined
      if (nameRef.current) {
        nameRef.current.style.transform = `translateX(0px)`
      }
    }
  }, [auto, hover])

  const onFrame = useCallback(() => {
    const nameWidth = (nameRef.current as HTMLParagraphElement).clientWidth
    const boxWidth = (boxRef.current as HTMLDivElement).clientWidth
    if (nameWidth <= boxWidth) return
    const distance = Math.min(Math.abs(animateX.current.x + nameWidth - boxWidth), stepRef.current) || stepRef.current
    if (animateX.current.orient) {
      animateX.current.x += distance
    } else {
      animateX.current.x -= distance
    }
    if (nameRef.current) {
      nameRef.current.style.transform = `translateX(${animateX.current.x}px)`
    }
    if (animateX.current.x <= boxWidth - nameWidth) {
      animateX.current.orient = true
    } else if (animateX.current.x >= 0) {
      animateX.current.orient = false
    }
    animHandler.current = window.requestAnimationFrame(onFrame)
  }, [])

  const onMouseOver = React.useCallback(function () {
    setHover(true)
  }, [])

  const onMouseOut = React.useCallback(function () {
    setHover(false)
  }, [])

  return (
    <div
      ref={boxRef}
      className={`${styles.nameLabel} ${className}`}
      style={style}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}>
      <p ref={nameRef}>{name}</p>
    </div>
  )
})

export default NameLabel
