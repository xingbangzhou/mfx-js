import './index.scss'
import TitleBar from './TitleBar'
import {memo, useEffect} from 'react'
import LeftBar from './LeftBar'
import MainView from './MainView'

function App() {
  useEffect(() => {}, [])

  return (
    <div className="app">
      <TitleBar />
      <div className="mainArea">
        <LeftBar />
        <MainView />
      </div>
    </div>
  )
}

export default memo(App)
