import {createContext} from 'react'

interface TreeViewContextProps {
  defaultExpanded?: string[]
  defaultSelected?: string
}

const defaultContext: TreeViewContextProps = {}

const TreeViewContext = createContext(defaultContext)

export default TreeViewContext
