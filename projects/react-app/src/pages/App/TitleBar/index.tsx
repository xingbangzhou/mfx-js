import {memo} from 'react'
import {Button} from '@mco/rui'

const Empty = memo(function Empty() {
  return <div className="titleBar-empty" />
})

const TitleBar = memo(function TitleBar() {
  return (
    <div className={'titleBar'}>
      <Empty />
      <Button className="titleBar-buttonEx" content="我的应用" />
    </div>
  )
})

export default TitleBar
