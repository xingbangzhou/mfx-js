import React, {memo} from 'react'
import VAPView from 'src/modules/VAPView'
import styles from './index.module.scss'

const MainView = memo(function MainView() {
  return (
    <div className={styles.mainView}>
      <VAPView />
    </div>
  )
})

export default MainView
