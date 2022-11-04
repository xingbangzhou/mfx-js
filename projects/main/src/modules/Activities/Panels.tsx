import {observer} from 'mobx-react-lite'
import {memo, useEffect} from 'react'
import framework from 'src/core/framework'
import service, {ActItemInfo} from './service'
import styles from './index.module.scss'

type PanelProps = ActItemInfo

const Panel = memo(function Panel(props: PanelProps) {
  return <></>
})

const ActPanels = observer(function ActPanels() {
  const {itemList} = service

  useEffect(() => {
    const {mcoFw} = framework
    mcoFw.ctx.register(service)

    return () => {
      mcoFw.ctx.unregister(service)
    }
  }, [])

  return (
    <div className={styles.actPanels}>
      {itemList.map(el => (
        <Panel key={el.id} {...el} />
      ))}
    </div>
  )
})

export default memo(ActPanels)
