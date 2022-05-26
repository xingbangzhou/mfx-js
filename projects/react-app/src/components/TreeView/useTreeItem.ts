import {useContext, SyntheticEvent} from 'react'
import TreeViewContext from './TreeViewContext'

export default function useTreeItem(itemId: string) {
  const {isExpanded, isExpandable, isSelected, selectItem, toggleExpansion} = useContext(TreeViewContext)

  const expanded = isExpanded ? isExpanded(itemId) : false
  const selected = isSelected ? isSelected(itemId) : false

  const handleExpansion = (event: SyntheticEvent) => {
    const expandable = isExpandable ? isExpandable(itemId) : false

    if (expandable && toggleExpansion) {
      toggleExpansion(event, itemId)
    }
  }

  const handleSelection = (event: SyntheticEvent) => {
    if (selectItem) {
      selectItem(event, itemId)
    }
  }

  const preventSelection = (event: SyntheticEvent) => {
    if (event['shiftKey'] || event['ctrlKey'] || event['metaKey']) {
      event.preventDefault()
    }
  }

  return {
    expanded,
    selected,
    handleExpansion,
    handleSelection,
    preventSelection,
  }
}
