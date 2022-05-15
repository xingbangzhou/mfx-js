import React from 'react'
import styles from './index.module.scss'
import Ripple from './Ripple'

export interface ButtonProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

const Button = React.memo(function Button(props: ButtonProps) {
  const {className, style, children} = props

  return (
    <button className={`${styles.buttonWrap} ${className}`} style={style}>
      {children}
      <Ripple />
    </button>
  )
})

export default Button
