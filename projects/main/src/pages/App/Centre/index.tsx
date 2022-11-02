import {memo} from 'react'
import Right from './Right'
import styles from './index.module.scss'
import Left from './Left'
import Middle from './Middle'

const Centre = memo(function Center() {
  return (
    <div className={styles.centre}>
      <Left />
      <Middle />
      <Right />
    </div>
  )
})

export default Centre
