import {memo} from 'react'
import TreeView from 'src/components/TreeView'

const Content = memo(function Content() {
  return (
    <div>
      <TreeView />
    </div>
  )
})

export default Content
