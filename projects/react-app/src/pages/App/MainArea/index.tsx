import {memo} from 'react'
import GLScene from 'src/modules/GLScene'

const MainArea = memo(function MainArea() {
  return (
    <div className="mainArea">
      <GLScene />
    </div>
  )
})

export default MainArea
