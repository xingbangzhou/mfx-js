import {memo} from 'react'
import styles from './index.module.scss'
import {TreeView} from '@mfx-js/gui'

const Content = memo(function Content() {
  return (
    <div className={styles.content}>
      <TreeView />
    </div>
  )
})

export default Content
