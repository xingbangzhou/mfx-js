import './index.scss'
import LeftBar from './LeftBar'
import TitleBar from './TitleBar'
import MainArea from './MainArea'
import {memo} from 'react'

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
