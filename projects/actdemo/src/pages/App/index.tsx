import './index.scss'
import {memo, useEffect} from 'react'
import mcoApi from 'src/mcoApi'

function App() {
  useEffect(() => {
    mcoApi
  }, [])

  return (
    <div className="app">
      <div className="title">Qiankun App</div>
    </div>
  )
}

export default memo(App)
