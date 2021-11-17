import {memo} from 'react'
import './index.scss'
import TitleBar from './TitleBar'

const App = memo(function App() {
  return (
    <div className="app">
      <TitleBar></TitleBar>
    </div>
  )
})

export default App
