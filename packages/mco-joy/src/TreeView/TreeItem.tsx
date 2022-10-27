import {forwardRef, memo, ReactNode, Ref, useContext, useEffect, useMemo, useState, HTMLAttributes} from 'react'
import {useForkRef} from '@mco/utils'
import {DescendantProvider, useDescendant} from './descendants'
import TreeItemContent from './TreeItemContent'
import TreeViewContext from './TreeViewContext'
import styled from '@emotion/styled'
import Collapse from '../Collapse'

interface TreeItemProps extends HTMLAttributes<HTMLElement> {
  itemId: string
  id?: string
  className?: string
  children?: ReactNode
  label?: ReactNode
  icon?: ReactNode
  expandIcon?: ReactNode
  collapseIcon?: ReactNode
  endIcon?: ReactNode
}

const TreeItemRoot = styled.li`
  list-style: none;
  margin: 0;
  padding: 0;
  outline: 0;
`

const TreeItemGroup = styled(Collapse)`
  margin: 0;
  padding: 0;
  margin-left: 16px;
`

const StyledTreeItemContent = styled(TreeItemContent)`
  padding: 8px 8px;
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  color: #aaaeb9;
  -webkit-tap-highlight-color: transparent;
  border-radius: 8px;
  margin-bottom: 4px;
  &.selected {
    color: rgb(16, 185, 129);
    background-color: rgba(255, 255, 255, 0.08);
  }
  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
  .iconContainer {
    margin-right: 4px;
    width: 15px;
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    & svg {
      width: 100%;
      height: 100%;
      font-size: 18px;
    }
  }
  .label {
    width: 100%;
    min-width: 0;
    padding-left: 4px;
    position: relative;
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji',
      'Segoe UI Emoji';
    font-size: 0.875rem;
    line-height: 1.75;
    font-weight: 700;
    text-align: left;
    text-transform: none;
  }
`

const TreeItem = forwardRef(function TreeItem(props: TreeItemProps, ref?: Ref<HTMLLIElement>) {
  const {itemId, id: idProp, className, children, label, icon, expandIcon, collapseIcon, endIcon, ...other} = props

  const {
    icons: contextIcons,
    isExpanded,
    isSelected,
    registerItem,
    unregisterItem,
    treeId,
  } = useContext(TreeViewContext)

  let id: string | undefined = undefined
  if (idProp != undefined) {
    id = idProp
  } else if (treeId && itemId) {
    id = `${treeId}-${itemId}`
  }

  const [treeItemEl, setTreeItemEl] = useState<HTMLLIElement | null>(null)
  const handleRef = useForkRef<HTMLLIElement>(setTreeItemEl, ref)

  const descendant = useMemo(
    () => ({
      element: treeItemEl,
      id: itemId,
    }),
    [itemId, treeItemEl],
  )

  const {index, parentId} = useDescendant(descendant)

  const expandable = Boolean(Array.isArray(children) ? children.length : children)
  const expanded = isExpanded ? isExpanded(itemId) : false
  const selected = isSelected ? isSelected(itemId) : false

  let displayIcon: ReactNode = undefined
  let expansionIcon: ReactNode = undefined

  if (expandable) {
    if (!expanded) {
      expansionIcon = collapseIcon || contextIcons.defaultCollapseIcon
    } else {
      expansionIcon = expandIcon || contextIcons.defaultExpandIcon
    }
  }

  if (!expandable) {
    displayIcon = endIcon || contextIcons.defaultEndIcon
  }

  useEffect(() => {
    if (registerItem && unregisterItem && index !== -1) {
      registerItem({
        id: itemId,
        idAttribute: id,
        index,
        parentId,
        expandable,
      })

      return () => {
        unregisterItem(itemId)
      }
    }
  }, [registerItem, unregisterItem, parentId, index, itemId, expandable, id])

  return (
    <TreeItemRoot
      id={id}
      ref={handleRef}
      className={className}
      role="treeitem"
      aria-expanded={expandable ? expanded : undefined}
      aria-selected={selected}
      tabIndex={-1}
    >
      <StyledTreeItemContent
        label={label}
        itemId={itemId}
        icon={icon}
        expansionIcon={expansionIcon}
        displayIcon={displayIcon}
        {...other}
      />
      {children && (
        <DescendantProvider id={itemId}>
          <TreeItemGroup in={expanded} unmountOnExit>
            {children}
          </TreeItemGroup>
        </DescendantProvider>
      )}
    </TreeItemRoot>
  )
})

export default memo(TreeItem)
