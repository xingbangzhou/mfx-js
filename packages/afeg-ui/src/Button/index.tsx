import React from 'react'
import styles from './index.module.scss'

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
    </button>
  )
})

export default Button
