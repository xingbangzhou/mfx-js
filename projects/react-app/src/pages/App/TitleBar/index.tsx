import {memo} from 'react'
import Button from 'src/components/Button'
import styles from './index.module.scss'

const TitleBar = memo(function TitleBar() {
  return (
    <div className={styles.titleBar}>
      <Button className={styles.btn} />
    </div>
  )
})

export default TitleBar
