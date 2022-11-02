import {memo} from 'react'
import QKView from 'src/components/QKView'
import styles from './index.module.scss'

const Left = memo(function Left() {
  return (
    <div className={styles.left}>
      <QKView className={styles.qkView} name="qk-mo" url="http://localhost:3003" />
    </div>
  )
})

export default Left
