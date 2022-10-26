import {memo} from 'react'
import FrameView from 'src/components/FrameView'
import styles from './index.module.scss'

const Board = memo(function Board() {
  return (
    <div className={styles.board}>
      <FrameView src="http://localhost:5003/" />
    </div>
  )
})

export default Board
