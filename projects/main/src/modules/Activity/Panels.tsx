import {observer} from 'mobx-react-lite'
import {memo, useEffect} from 'react'
import mainFw from 'src/core/fw'
import styles from './index.module.scss'
import ctx from './ctx'
import QKunView from 'src/components/QKunView'

interface PanelProps {
  actId: number
  url?: string
  visible?: boolean
}

const Panel = memo(function Panel(props: PanelProps) {
  const {actId, url, visible} = props

  return (
    <QKunView
      fw={mainFw.instance}
      className={styles.panel}
      data-visible={visible}
      name={`activity#${actId}`}
      url={url}
    />
  )
})

const ActivityPanels = observer(function ActivityPanels() {
  const {itemList, focuseId} = ctx

  useEffect(() => {
    const {ctx: mainCtx} = mainFw.instance
    mainCtx.register(ctx)

    ctx.add([{actId: 1, url: 'http://localhost:3001'}])
    ctx.setActInfo(1, {title: '活动条#1'})

    return () => {
      mainCtx.unregister(ctx)
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
