import {memo} from 'react'
import {Button} from '@mco/joy'
import styles from './index.module.scss'

const TitleBar = memo(function TitleBar() {
  return (
    <div className={styles.titleBar}>
      <Button content="Application" />
    </div>
  )
})

export default TitleBar
