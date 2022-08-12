import styled from '@emotion/styled'
import {memo, SyntheticEvent, useCallback, useEffect, useMemo, useState} from 'react'
import {bizCenter} from 'src/modules'
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
  const [selectId, setSelectId] = useState<string | undefined>(bizCenter.activedId)

  const itemList = useMemo(() => {
    const {bizList} = bizCenter
    return bizList.map(({id, title, items}) => (
      <TreeItem key={id} itemId={id} label={title}>
        {items.map(({id, name}) => (
          <TreeItem key={id} itemId={id} label={name} />
        ))}
      </TreeItem>
    ))
  }, [])

  const defaultExpanded = useMemo(() => {
    const {bizList} = bizCenter
    return bizList.map(el => el.id)
  }, [])

  const onTreeItemSelected = useCallback((event: SyntheticEvent, itemId?: string | string[]) => {
    const {bizList} = bizCenter
    const findex = bizList.findIndex(({items}) => items.find(({id}) => id === itemId))
    if (findex !== -1) {
      setSelectId(itemId as string)
    }
  }, [])

  const isTreeItemSelected = useCallback((id: string, selected?: string) => {
    const {bizList} = bizCenter
    const rootItem = bizList.find(el => el.id === id)
    if (!rootItem) return false
    return !!rootItem.items.find(el => el.id === selected)
  }, [])

  useEffect(() => {
    bizCenter.activedId = selectId
  }, [selectId])

  return (
    <ContentRoot>
      <Title>PLATFORMS</Title>
      <TreeView
        defaultExpanded={defaultExpanded}
        selected={selectId}
        onItemSelect={onTreeItemSelected}
        isSelected={isTreeItemSelected}
      >
        {itemList}
      </TreeView>
    </ContentRoot>
  )
})

export default Content
