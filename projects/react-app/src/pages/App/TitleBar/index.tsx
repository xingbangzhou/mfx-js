import {memo} from 'react'
import {Button} from '@mco/ui'
import styles from './index.module.scss'

const Menus = memo(function Menus() {
  return <div className={styles.menus} />
})

const TitleBar = memo(function TitleBar() {
  return (
    <div className={styles.titleBar}>
      <Menus />
      <Button className="titleBar-button" content="Application" />
    </div>
  )
})

export default TitleBar
