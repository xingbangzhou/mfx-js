import React from 'react'
import {getUnit, SplitType} from './_fns'

interface SplitPaneProps {
  id?: string
  children?: React.ReactNode
  className?: string
  initialSize?: string
  size?: string
  minSize?: string
  maxSize?: string
  // 内部使用
  type?: SplitType
  innerRef?: (element: HTMLDivElement) => void
}

export default function SplitPane(props: SplitPaneProps) {
  const {
    id,
    children,
    className,
    type = 'vertical',
    initialSize = '1',
    size,
    minSize = '0',
    maxSize = '100%',
    innerRef,
  } = props

  const style = React.useMemo(
    function () {
      const value = size || initialSize
      const vertical = type === 'vertical'
      const styleProp = {
        minSize: vertical ? 'minWidth' : 'minHeight',
        maxSize: vertical ? 'maxWidth' : 'maxHeight',
        size: vertical ? 'width' : 'height',
      }

      const style: Record<string, any> = {
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
    [type, initialSize, size, minSize, maxSize],
  )

  return (
    <div
      ref={el => {
        innerRef?.(el as HTMLDivElement)
      }}
      id={id}
      className={className}
      style={style}
    >
      {children}
    </div>
  )
}
