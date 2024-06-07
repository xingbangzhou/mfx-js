import './index.scss'
import TitleBar from './TitleBar'
import {memo, useEffect} from 'react'
import LeftBar from './LeftBar'
import MainView from './MainView'
import {bizCore} from 'src/core'

const App = memo(function App() {
  useEffect(() => {
    bizCore.init()
  }, [])

  return (
    <div className="app">
      <TitleBar />
      <div className="mainArea">
        <LeftBar />
        <MainView />
      </div>
    </div>
  )
})

export default App
