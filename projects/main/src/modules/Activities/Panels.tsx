import {observer} from 'mobx-react-lite'
import {memo, useEffect, useMemo} from 'react'
import framework from 'src/core/framework'
import service, {ActItemInfo} from './service'
import styles from './index.module.scss'
import MicroView from 'src/components/MicroView'

type PanelProps = ActItemInfo & {visible?: boolean}

const Panel = memo(function Panel(props: PanelProps) {
  const {actId, url, visible} = props

  return <MicroView className={styles.panel} data-visible={visible} name={`actitem_${actId}`} url={url} />
})

const ActPanels = observer(function ActPanels() {
  const {itemList, focuseId} = service

  useEffect(() => {
    const {mcoFw} = framework
    mcoFw.ctx.register(service)

    return () => {
      mcoFw.ctx.unregister(service)
    }
  }, [])

  const visible = useMemo(() => {
    console.log(focuseId)
    return !!focuseId
  }, [focuseId])

  const style = useMemo(() => {
    const item = itemList.find(el => el.actId === focuseId)
    return item
      ? {
          width: '190px',
          height: `${Math.min(224, item.height)}px`,
        }
      : undefined
  }, [focuseId])

  return (
    <div className={styles.actPanels} style={style} data-visible={visible}>
      {itemList.map(el => (
        <Panel key={el.actId} {...el} visible={focuseId === el.actId} />
      ))}
    </div>
  )
})

export default memo(ActPanels)
