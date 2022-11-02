import {memo} from 'react'
import FrameView from 'src/components/FrameView'
import styles from './index.module.scss'

const Right = memo(function Right() {
  return (
    <div className={styles.right}>
      <FrameView className={styles.frameView} src="http://localhost:3002" />
    </div>
  )
})

export default Right
