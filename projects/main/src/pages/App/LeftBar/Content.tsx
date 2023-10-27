import {memo} from 'react'
import styles from './index.module.scss'

const Content = memo(function Content() {
  return <div className={styles.content}></div>
})

export default Content
