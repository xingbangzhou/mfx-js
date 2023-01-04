import {createContext, ReactNode, SyntheticEvent} from 'react'

export interface RegisterTreeItemProps {
  id: string
  index: number
  parentId: string | null
  expandable?: boolean
  idAttribute?: string
}

export interface TreeViewContextProps {
  icons: {defaultCollapseIcon?: ReactNode; defaultEndIcon?: ReactNode; defaultExpandIcon?: ReactNode}
  isExpanded?: (id: string) => boolean
  isExpandable?: (id: string) => boolean | undefined
  isSelected?: (id: string) => boolean
  toggleExpansion?: (event: SyntheticEvent, value: string) => void
  selectItem?: (event: SyntheticEvent, id: string) => boolean
  registerItem?: (item: RegisterTreeItemProps) => void
  unregisterItem?: (id: string) => void
  treeId?: string
}

const defaultContext: TreeViewContextProps = {icons: {}}

const TreeViewContext = createContext(defaultContext)

export default TreeViewContext
