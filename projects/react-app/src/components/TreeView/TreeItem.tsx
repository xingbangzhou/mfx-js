import {HTMLAttributes, memo, ReactNode, useMemo} from 'react'
import TreeItemContent from './TreeItemContent'

interface TreeItemProps {
  itemId: string
  id?: string
  className?: string
  children?: ReactNode
  label?: ReactNode
}

const TreeItemRoot = memo(function TreeItemRoot(props: HTMLAttributes<HTMLLIElement>) {
  const style = useMemo(() => {
    return {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      outline: 0,
    }
  }, [])

  return <li style={style} {...props}></li>
})

const TreeItemGroup = memo(function TreeItemGroup(props: {children?: ReactNode}) {
  const {children} = props

  const style = useMemo(() => {
    return {
      margin: 0,
      padding: 0,
      marginLeft: '16px',
    }
  }, [])

  return <ul style={style}>{children}</ul>
})

const TreeItem = memo(function TreeItem(props: TreeItemProps) {
  const {itemId, id, className, children, label} = props

  return (
    <TreeItemRoot id={id} className={className}>
      <TreeItemContent label={label} />
      {children && <TreeItemGroup>{children}</TreeItemGroup>}
    </TreeItemRoot>
  )
})

export default TreeItem
