import './index.scss'
import TitleBar from './TitleBar'
import MainArea from './MainArea'
import {memo} from 'react'

function App() {
  return (
    <div className="app">
      <TitleBar />
      <div className="content">
        <MainArea />
      </div>
    </div>
  )
}

export default memo(App)
