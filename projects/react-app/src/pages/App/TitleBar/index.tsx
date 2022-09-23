import styled from '@emotion/styled'
import {memo} from 'react'
import {Button} from '@mco/rui'

const Empty = styled.div`
  flex-grow: 1;
`

const ButtonEx = styled(Button)`
  height: 32px;
  border-radius: 4px;
  padding: 0 10px;
  overflow: hidden;
`

const TitleBar = memo(function TitleBar() {
  return (
    <div className={'titleBar'}>
      <Empty />
      <ButtonEx content="Application" />
    </div>
  )
})

export default TitleBar
