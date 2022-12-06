import {memo} from 'react'
import {ActivityPanels} from 'src/modules/Activity'
import styles from './index.module.scss'

const Left = memo(function Left() {
  return (
    <div className={styles.left}>
      <ActivityPanels />
    </div>
  )
})

export default Left
