import './index.scss'
import TitleBar from './TitleBar'
import Centre from './Centre'
import {memo, useEffect} from 'react'
import LeftBar from './LeftBar'
import Splittable, {SplitPane} from 'src/components/Splittable'
import Right from './Right'

const dimensions = {
  RightMin: '273px',
  RightMax: '420px',
  CentreMin: '820px',
}

function App() {
  useEffect(() => {}, [])

  return (
    <div className="app">
      <TitleBar />
      <div className="mainArea">
        <LeftBar />
        <Splittable>
          <SplitPane minSize={dimensions.CentreMin}>
            <Centre />
          </SplitPane>
          <SplitPane initialSize={dimensions.RightMin} minSize={dimensions.RightMin} maxSize={dimensions.RightMax}>
            <Right />
          </SplitPane>
        </Splittable>
      </div>
    </div>
  )
}

export default memo(App)
