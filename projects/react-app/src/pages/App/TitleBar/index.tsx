import {memo} from 'react'
import styles from './index.module.scss'

const TitleBar = memo(function TitleBar() {
  return <div className={styles.titleBar}></div>
})

export default TitleBar
