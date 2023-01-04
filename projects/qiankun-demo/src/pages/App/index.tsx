import './index.scss'
import {memo, useEffect, useState} from 'react'
import mfx from 'src/mfx'

function App() {
  const [title, setTitle] = useState<string>()

  useEffect(() => {
    mfx.invoke('ActivityService', 'getActInfo', 1).then(actInfo => {
      setTitle(actInfo?.title)
    })

    const onActInfoChanged = function (actInfo: any) {
      setTitle(actInfo?.title)
    }

    mfx.connectSignal('ActivityService', 'ActInfoSignal_#1', onActInfoChanged)

    return () => {
      mfx.disconnectSignal('ActivityService', 'ActInfoSignal_#1', onActInfoChanged)
    }
  }, [])

  return (
    <div className="app">
      <div className="title">{title}</div>
    </div>
  )
}

export default memo(App)
