import React, {CSSProperties, useMemo} from 'react'

export type SpriteIconProps = {
  src?: string
  index?: number
  width?: number
  height?: number
} & React.HTMLAttributes<HTMLSpanElement>

export default function SpriteIcon({style, className, src, index = 0, width, height, ...other}: SpriteIconProps) {
  const realStyle: CSSProperties = useMemo(() => {
    const result: CSSProperties = {
      ...style,
      backgroundImage: src ? `url(${src})` : undefined,
      ...(width && {
        width: `${width}px`,
        minWidth: `${width}px`,
        display: 'inline-block',
        backgroundPositionX: `${-width * (index - 1)}px`,
      }),
      ...(height && {height: `${height}px`}),
    }
    return result
  }, [style, width, height, index])

  const visible = useMemo(() => {
    return index > 0
  }, [index])

  return <>{visible ? <span {...other} style={realStyle} className={className} /> : null}</>
}
