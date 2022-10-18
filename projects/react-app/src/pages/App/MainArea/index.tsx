import {memo} from 'react'
import MP4View from 'src/modules/MP4View'

const MainArea = memo(function MainArea() {
  return (
    <div className="mainArea">
      <MP4View />
    </div>
  )
})

export default MainArea
