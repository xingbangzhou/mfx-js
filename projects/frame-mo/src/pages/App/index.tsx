import './index.scss'
import {memo, useEffect} from 'react'
import activator from 'src/activator'

function App() {
  useEffect(() => {
    activator.ensure(ctx => {
      ctx.resize(224, 160)
    })
  }, [])

  return <div className="app">Frame Module</div>
}

export default memo(App)
