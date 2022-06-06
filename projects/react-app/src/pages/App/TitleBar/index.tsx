import styled from '@emotion/styled'
import {memo} from 'react'
import Button from 'src/components/Button'

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
      <ButtonEx title="Application" />
    </div>
  )
})

export default TitleBar
