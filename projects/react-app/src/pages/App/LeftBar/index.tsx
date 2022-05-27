import {memo} from 'react'
import Content from './Content'

const LeftBar = memo(function LeftBar() {
  return (
    <div className={'leftBar'}>
      <Content />
    </div>
  )
})

export default LeftBar
