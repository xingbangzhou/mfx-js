import {memo, useCallback, DragEvent, useState} from 'react'
import styled from '@emotion/styled'

type DrapAreaProps = {
  onDrapped?: (fileObj: File) => void
} & React.HTMLAttributes<HTMLDivElement>

const Cover = styled.div`
  position: absolute;
  pointer-events: none;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  border-style: solid;
  border-width: 2px;
  border-color: royalblue;
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 100%;
  font-size: 16px;
  font-weight: bolder;
  color: royalblue;
`

const DrapArea = function (props: DrapAreaProps) {
  const {onDrapped, children, ...other} = props

  const [drapping, setDrapping] = useState<true>()

  const onDragEnter = useCallback((ev: DragEvent<HTMLDivElement>) => {
    ev.preventDefault()
    ev.stopPropagation()

    setDrapping(true)
  }, [])

  const onDragOver = useCallback((ev: DragEvent<HTMLDivElement>) => {
    ev.preventDefault()
    ev.stopPropagation()

    setDrapping(true)
  }, [])

  const onDragLeave = useCallback((ev: DragEvent<HTMLDivElement>) => {
    ev.preventDefault()
    ev.stopPropagation()

    setDrapping(undefined)
  }, [])

  const onDrop = useCallback(
    (ev: DragEvent<HTMLDivElement>) => {
      ev.preventDefault()
      ev.stopPropagation()

      setDrapping(undefined)

      const df = ev.dataTransfer
      const file = df.files[0]
      if (!file) return

      onDrapped?.(file)
    },
    [onDrapped],
  )

  return (
    <div onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} {...other}>
      {drapping && <Cover />}
      {children}
    </div>
  )
}

export default memo(DrapArea)
