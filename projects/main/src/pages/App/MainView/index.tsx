import React, {memo} from 'react'
import styles from './index.module.scss'
import AnimView from './AnimView'

const MainView = memo(function MainView() {
  return (
    <div className={styles.mainView}>
      <AnimView />
    </div>
  )
})

export default MainView
