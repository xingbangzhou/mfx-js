import './index.scss'
import {memo, useEffect, useState} from 'react'
import mscx from 'src/mscx'

function App() {
  const [title, setTitle] = useState<string>()

  useEffect(() => {
    mscx.invoke('ActivityService', 'getActInfo', 1).then(actInfo => {
      setTitle(actInfo?.title)
    })

    const onActInfoChanged = function (clazz: string, signal: string, actInfo: any) {
      setTitle(actInfo?.title)
    }

    mscx.connectSignal('ActivityService', 'ActInfoSignal_#1', onActInfoChanged)

    return () => {
      mscx.disconnectSignal('ActivityService', 'ActInfoSignal_#1', onActInfoChanged)
    }
  }, [])

  return (
    <div className="app">
      <div className="title">{title}</div>
    </div>
  )
}

export default memo(App)
