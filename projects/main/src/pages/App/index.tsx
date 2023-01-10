import './index.scss'
import TitleBar from './TitleBar'
import {memo, useEffect} from 'react'
import LeftBar from './LeftBar'
import Content from './Content'

function App() {
  useEffect(() => {}, [])

  return (
    <div className="app">
      <TitleBar />
      <div className="mainArea">
        <LeftBar />
        <Content />
      </div>
    </div>
  )
}

export default memo(App)
