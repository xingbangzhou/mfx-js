import {memo} from 'react'
import styles from './index.module.scss'

const Middle = memo(function Middle() {
  return <div className={styles.middle}></div>
})

export default Middle
