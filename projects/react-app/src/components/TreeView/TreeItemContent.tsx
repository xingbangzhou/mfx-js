import {memo, ReactNode, useMemo} from 'react'

interface TreeItemContentProps {
  label?: ReactNode
}

const TreeItemContent = memo(function TreeItemContent(props: TreeItemContentProps) {
  const {label} = props

  const style = useMemo(() => {
    return {
      padding: '0 8px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent',
    }
  }, [])

  return <div style={style}>{label}</div>
})

export default TreeItemContent
