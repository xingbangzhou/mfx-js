import {memo} from 'react'
import styles from './index.module.scss'
import Button from '@mui/material/Button'

const TitleBar = memo(function TitleBar() {
  return (
    <div className={styles.titleBar}>
      <Button content="Home" />
    </div>
  )
})

export default TitleBar
