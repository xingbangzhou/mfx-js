import {memo} from 'react'
import {ActPanels} from 'src/modules/Activities'
import styles from './index.module.scss'

const Left = memo(function Left() {
  return (
    <div className={styles.left}>
      <ActPanels />
    </div>
  )
})

export default Left
