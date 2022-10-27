import './index.scss'
import TitleBar from './TitleBar'
import MainArea from './MainArea'
import {memo, useEffect} from 'react'
import LeftBar from './LeftBar'
import Board from './Board'
import framework from 'src/core/framework'

function App() {
  useEffect(() => {
    const {ctx} = framework.mcoFw
  }, [])

  return (
    <div className="app">
      <TitleBar />
      <div className="content">
        <LeftBar />
        <MainArea />
      </div>
      <Board />
    </div>
  )
}

export default memo(App)
