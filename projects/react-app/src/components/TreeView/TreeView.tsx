import {forwardRef, memo, ReactNode, Ref, SyntheticEvent, useCallback, useRef} from 'react'
import useControlled from 'src/hooks/useControlled'
import useForkRef from 'src/hooks/useForkRef'
import useReactId from 'src/hooks/useReactId'
import {DescendantProvider} from './descendants'
import TreeViewContext, {RegisterTreeItemProps} from './TreeViewContext'
import styled from '@emotion/styled'
import {DefaultCollapseIcon, DefaultExpandIcon} from './Icons'

interface TreeViewProps {
  id?: string
  // The content of the component.
  children?: ReactNode
  // The default icon used to collapse the node.
  defaultCollapseIcon?: ReactNode
  // The default icon displayed next to a end node.
  defaultEndIcon?: ReactNode
  // The default icon used to expand the node
  defaultExpandIcon?: ReactNode
  // Expanded node ids.
  defaultExpanded?: string[]
  expanded?: string[]
  onItemToggle?: (event: SyntheticEvent, itemIds?: string | string[]) => void
  // Selected
  defaultSelected?: string
  selected?: string
  onItemSelect?: (event: SyntheticEvent, itemIds?: string | string[]) => void
  isSelected?: (id: string, selected?: string) => boolean
}

const TreeViewRoot = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
  outline: 0;
`

const TreeView = forwardRef(function TreeView(props: TreeViewProps, ref?: Ref<HTMLUListElement>) {
  const {
    id: idProp,
    children,
    defaultCollapseIcon = <DefaultCollapseIcon />,
    defaultEndIcon,
    defaultExpandIcon = <DefaultExpandIcon />,
    defaultExpanded = [],
    expanded: expandedProp,
    onItemToggle,
    defaultSelected,
    selected: selectedProp,
    onItemSelect,
    isSelected: isSelectedProp,
  } = props

  const treeId = useReactId(idProp)

  const treeRef = useRef<HTMLUListElement>(null)
  const handleRef = useForkRef(treeRef, ref)

  const itemMap = useRef<Record<string, RegisterTreeItemProps>>({})

  const [expanded, setExpandedState] = useControlled({
    controlled: expandedProp,
    default: defaultExpanded,
    name: 'TreeView',
    state: 'expanded',
  })

  const [selected, setSelectedState] = useControlled({
    controlled: selectedProp,
    default: defaultSelected,
    name: 'TreeView',
    state: 'selected',
  })

  const isExpanded = useCallback(
    (id: string) => (Array.isArray(expanded) ? expanded.indexOf(id) !== -1 : false),
    [expanded],
  )

  const isExpandable = useCallback((id: string) => itemMap.current[id] && itemMap.current[id].expandable, [])

  const isSelected = useCallback(
    (id: string) =>
      (Array.isArray(selected) ? selected.indexOf(id) !== -1 : selected === id) ||
      (isSelectedProp ? isSelectedProp(id, selected) : false),
    [selected],
  )

  const registerItem = useCallback((item: RegisterTreeItemProps) => {
    const {id, index, parentId, expandable, idAttribute} = item

    itemMap.current[id] = {id, index, parentId, expandable, idAttribute}
  }, [])

  const unregisterItem = useCallback((id: string) => {
    const newMap = {...itemMap.current}
    delete newMap[id]
    itemMap.current = newMap
  }, [])

  /**
   * Expansion
   */
  const toggleExpansion = (event: SyntheticEvent, value: string) => {
    let newExpanded: string[] | undefined = undefined
    if (expanded!.indexOf(value) !== -1) {
      newExpanded = expanded!.filter(el => el !== value)
    } else {
      newExpanded = [value].concat(expanded!)
    }

    if (onItemToggle) {
      onItemToggle(event, newExpanded)
    }

    setExpandedState(newExpanded)
  }

  /**
   * Select
   */
  const handleSingleSelect = (event: SyntheticEvent, value: string) => {
    const newSelected = value

    if (onItemSelect) {
      onItemSelect(event, newSelected)
    }

    setSelectedState(newSelected)
  }

  const selectItem = (event: SyntheticEvent, id: string) => {
    if (id) {
      handleSingleSelect(event, id)
      return true
    }

    return false
  }

  return (
    <TreeViewContext.Provider
      value={{
        icons: {defaultCollapseIcon, defaultExpandIcon, defaultEndIcon},
        isExpanded,
        isExpandable,
        isSelected,
        toggleExpansion,
        selectItem,
        registerItem,
        unregisterItem,
        treeId,
      }}>
      <DescendantProvider>
        <TreeViewRoot id={treeId} ref={handleRef}>
          {children}
        </TreeViewRoot>
      </DescendantProvider>
    </TreeViewContext.Provider>
  )
})

export default memo(TreeView)
