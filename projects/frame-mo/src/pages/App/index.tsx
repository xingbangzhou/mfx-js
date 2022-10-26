import './index.scss'
import {memo, useEffect} from 'react'
import binder from 'src/core/binder'

function App() {
  useEffect(() => {
    binder.doing(() => {
      binder.ctx?.resize(224, 160)
    })
  }, [])

  return <div className="app"></div>
}

export default memo(App)
