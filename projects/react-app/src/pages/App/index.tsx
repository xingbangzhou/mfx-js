import './index.scss'
import TitleBar from './TitleBar'
import MainArea from './MainArea'
import {memo} from 'react'
import LeftBar from './LeftBar'

function App() {
  return (
    <div className="app">
      <TitleBar />
      <div className="content">
        <LeftBar />
        <MainArea />
      </div>
    </div>
  )
}

export default memo(App)
