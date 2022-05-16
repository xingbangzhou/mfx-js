import React from 'react'
import styles from './index.module.scss'
import Ripple from './Ripple'

export interface ButtonProps {
  className?: string
  style?: React.CSSProperties
  title?: string
}

const Button = React.memo(function Button(props: ButtonProps) {
  const {className, style, title} = props

  return (
    <button className={`${styles.buttonWrap} ${className}`} style={style}>
      {title}
      <Ripple />
    </button>
  )
})

export default Button
