import {memo} from 'react'
import MaixuList from './MaixuList'
import styles from './index.module.scss'

const Right = memo(function Right() {
  return (
    <div className={styles.right}>
      <MaixuList />
    </div>
  )
})

export default Right
