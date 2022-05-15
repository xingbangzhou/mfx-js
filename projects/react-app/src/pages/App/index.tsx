import './index.scss'
import LeftBar from './LeftBar'
import TitleBar from './TitleBar'
import MainArea from './MainArea'

export default function App() {
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
