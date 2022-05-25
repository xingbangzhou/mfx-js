import React, {forwardRef, HTMLAttributes, memo, ReactNode, Ref, useMemo} from 'react'
import TreeViewContext from './TreeViewContext'

interface TreeViewProps {
  id?: string
  // The content of the component.
  children?: ReactNode
  // The default icon used to collapse the node.
  defaultCollapseIcon?: ReactNode
  // Expanded node ids.
  defaultExpanded?: string[]
  // The default icon used to expand the node
  defaultExpandIcon?: ReactNode
  // Selected
  defaultSelected?: string
  selected?: string
  onItemSelect?: (event: React.SyntheticEvent, nodeIds?: string | string[]) => void
}

const TreeViewRoot = memo(
  forwardRef(function (props: HTMLAttributes<HTMLUListElement>, ref?: Ref<HTMLUListElement>) {
    const {id, children, ...other} = props

    const style = useMemo(() => {
      return {
        padding: '0',
        margin: '0',
        listStyle: 'none',
        outline: '0',
      }
    }, [])

    return (
      <ul id={id} ref={ref} style={style} {...other}>
        {children}
      </ul>
    )
  }),
)

TreeViewRoot.displayName = 'TreeViewRoot'

const TreeView = memo(
  forwardRef(function (props: TreeViewProps, ref?: Ref<HTMLUListElement>) {
    const {id, children, defaultExpanded, defaultSelected} = props

    return (
      <TreeViewContext.Provider value={{defaultExpanded, defaultSelected}}>
        <TreeViewRoot id={id} ref={ref}>
          {children}
        </TreeViewRoot>
      </TreeViewContext.Provider>
    )
  }),
)

TreeView.displayName = 'TreeView'

export default TreeView
