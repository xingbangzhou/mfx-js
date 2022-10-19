import {memo} from 'react'
import {Button} from '@mco/ui'

const Menus = memo(function Menus() {
  return <div className="titleBar-menus" />
})

const TitleBar = memo(function TitleBar() {
  return (
    <div className={'titleBar'}>
      <Menus />
      <Button className="titleBar-button" content="Application" />
    </div>
  )
})

export default TitleBar
