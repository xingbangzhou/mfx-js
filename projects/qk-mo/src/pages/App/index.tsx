import './index.scss'
import {memo, useEffect} from 'react'
import activator from 'src/activator'

function App() {
  useEffect(() => {
    activator.ensure(ctx => {})
  }, [])

  return <div className="app">Qiankun Module</div>
}

export default memo(App)
