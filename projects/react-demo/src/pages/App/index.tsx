import './index.scss'
import LeftBar from './LeftBar'
import TitleBar from './TitleBar'
import {SplitLayout, SplitPane} from '@grupjs/ui'
import MainArea from './MainArea'

export default function App() {
  return (
    <div className="app">
      <TitleBar></TitleBar>
      <div className="content">
        <SplitLayout>
          <SplitPane initialSize="200px" maxSize="400px">
            <LeftBar></LeftBar>
          </SplitPane>
          <SplitPane>
            <MainArea></MainArea>
          </SplitPane>
        </SplitLayout>
      </div>
    </div>
  )
}
