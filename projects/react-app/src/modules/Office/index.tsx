import {memo} from 'react'
import styles from './index.module.scss'

const Office = memo(function Office() {
  return (
    <div className={styles.office}>
      <div className={styles.div1}>
        <div className={styles.div2}></div>
      </div>
    </div>
  )
})

export default Office
