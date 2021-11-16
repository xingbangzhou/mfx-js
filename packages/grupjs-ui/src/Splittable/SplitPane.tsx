import React from 'react'
import {getUnit, SplitType} from './_fns'

interface SplitPaneProps {
  id?: string
  children?: React.ReactNode
  className?: string
  split?: SplitType
  initialSize?: string
  size?: string
  minSize?: string
  maxSize?: string
  innerRef?: (idx: number, element: HTMLDivElement) => void
  index?: number
}

export default function SplitPane(props: SplitPaneProps) {
  const {
    index,
    id,
    children,
    className,
    split = 'vertical',
    initialSize = '1',
    size,
    minSize = '0',
    maxSize = '100%',
    innerRef,
  } = props

  const style = React.useMemo(
    function () {
      const value = size || initialSize
      const vertical = split === 'vertical'
      const styleProp = {
        minSize: vertical ? 'minWidth' : 'minHeight',
        maxSize: vertical ? 'maxWidth' : 'maxHeight',
        size: vertical ? 'width' : 'height',
      }

      const style: React.CSSProperties = {
        display: 'flex',
        outline: 'none',
      }

      style[styleProp.minSize] = minSize
      style[styleProp.maxSize] = maxSize

      switch (getUnit(value)) {
        case 'ratio':
          style.flex = value
          break
        case '%':
        case 'px':
          style.flexGrow = 0
          style[styleProp.size] = value
          break
      }

      return style
    },
    [split, initialSize, size, minSize, maxSize],
  )

  return (
    <div
      ref={el => {
        innerRef?.(index as number, el as HTMLDivElement)
      }}
      id={id}
      className={className}
      style={style}>
      {children}
    </div>
  )
}
