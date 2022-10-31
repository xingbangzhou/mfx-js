import {memo} from 'react'
import QKView from 'src/components/QKView'
import styles from './index.module.scss'

const MainArea = memo(function MainArea() {
  return (
    <div className={styles.mainArea}>
      <QKView src="http://localhost:3003/" />
    </div>
  )
})

export default MainArea
