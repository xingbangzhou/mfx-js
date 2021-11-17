import {memo} from 'react'
import styles from './index.module.scss'
import {ReactComponent as SysMenuBtn} from '@assets/images/svg/sys-menu.svg'

const TitleBar = memo(function TitleBar() {
  return (
    <div className={styles.titlebar}>
      <SysMenuBtn></SysMenuBtn>
    </div>
  )
})

export default TitleBar
