import './index.scss'
import TitleBar from './TitleBar'
import MainArea from './MainArea'
import {memo} from 'react'
import LeftBar from './LeftBar'
import Board from './Board'

function App() {
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
