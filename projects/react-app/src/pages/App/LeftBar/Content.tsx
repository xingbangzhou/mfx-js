import styled from '@emotion/styled'
import {memo} from 'react'
import TreeView, {TreeItem} from 'src/components/TreeView'

const ContentRoot = styled.div`
  padding: 0 32px;
`

const Title = styled.header`
  box-sizing: border-box;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji';
  color: rgb(107, 114, 128);
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 2.5;
  margin-top: 32px;
  text-transform: uppercase;
  list-style: none;
`

const Content = memo(function Content() {
  return (
    <ContentRoot>
      <Title>PLATFORMS</Title>
      <TreeView>
        <TreeItem itemId="leason" label="Leason">
          <TreeItem itemId="mp4player" label="Mp4Player" />
        </TreeItem>
      </TreeView>
    </ContentRoot>
  )
})

export default Content
