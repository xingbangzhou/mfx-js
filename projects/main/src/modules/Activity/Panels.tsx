import {observer} from 'mobx-react-lite'
import {memo, useEffect} from 'react'
import framework from 'src/core/framework'
import styles from './index.module.scss'
import QKView from 'src/components/QKView'
import ctx from './ctx'
import {Button} from '@mco/joy'

interface PanelProps {
  actId: number
  url?: string
  visible?: boolean
}

const Panel = memo(function Panel(props: PanelProps) {
  const {actId, url, visible} = props

  return <QKView className={styles.panel} data-visible={visible} name={`activity#${actId}`} url={url} />
})

const ActivityPanels = observer(function ActivityPanels() {
  const {itemList, focuseId} = ctx

  useEffect(() => {
    const {mcoFw} = framework
    mcoFw.ctx.register(ctx)

    ctx.add([{actId: 1, url: 'http://localhost:3001'}])
    ctx.setActInfo(1, {title: '活动条#1'})

    return () => {
      mcoFw.ctx.unregister(ctx)
    }
  }, [])

  return (
    <div className={styles.activityPanels} data-display={!!focuseId}>
      {itemList.map(el => (
        <Panel key={el.actId} actId={el.actId} url={el.url} visible={focuseId === el.actId} />
      ))}
    </div>
  )
})

export default memo(ActivityPanels)
