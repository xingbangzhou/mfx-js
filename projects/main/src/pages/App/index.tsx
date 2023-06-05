import './index.scss'
import TitleBar from './TitleBar'
import {memo, useEffect} from 'react'
import LeftBar from './LeftBar'
import MainView from './MainView'
import {useNavigate} from 'react-router'

const App = memo(function App() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/login')
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
