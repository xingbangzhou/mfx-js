import clsx from 'clsx'
import React, {HTMLAttributes, memo, ReactNode, forwardRef, Ref, MouseEvent} from 'react'
import useTreeItem from './useTreeItem'

interface TreeItemContentProps extends HTMLAttributes<HTMLElement> {
  label?: ReactNode
  itemId: string
  icon?: ReactNode
  expansionIcon?: ReactNode
  displayIcon?: ReactNode
}

const TreeItemContent = forwardRef(function TreeItemContent(props: TreeItemContentProps, ref?: Ref<HTMLDivElement>) {
  const {className, label, itemId, icon: iconProp, expansionIcon, displayIcon, onClick, onMouseDown, ...other} = props

  const {expanded, selected, handleExpansion, handleSelection, preventSelection} = useTreeItem(itemId)

  const icon = iconProp || expansionIcon || displayIcon

  const handleMouseDown = (event: MouseEvent<HTMLElement>) => {
    preventSelection(event)

    if (onMouseDown) {
      onMouseDown(event)
    }
  }

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    handleExpansion(event)
    handleSelection(event)

    if (onClick) {
      onClick(event)
    }
  }

  return (
    <div
      className={clsx(className, {
        expanded: expanded,
        selected: selected,
      })}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      ref={ref}
      {...other}
    >
      <div className={'iconContainer'}>{icon}</div>
      <div className={'label'}>{label}</div>
    </div>
  )
})

export default memo(TreeItemContent)
