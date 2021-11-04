import React from 'react'

export type SplitType = 'vertical' | 'horizontal'

export function getUnit(size: string) {
  if (size.endsWith('px')) return 'px'
  if (size.endsWith('%')) {
    return '%'
  }
  return 'ratio'
}

export function convertToUnit(size: number, unit: '%' | 'px' | 'ratio', containerSize?: number) {
  switch (unit) {
    case '%':
      return `${((size / (containerSize as number)) * 100).toFixed(2)}%`
    case 'px':
      return `${size.toFixed(2)}px`
    case 'ratio':
      return (size * 100).toFixed(0)
  }
}

function toPx(value: number, unit = 'px', size: number) {
  switch (unit) {
    case '%': {
      return +((size * value) / 100).toFixed(2)
    }
    default: {
      return +value
    }
  }
}

export function convert(str: string, size: number) {
  const tokens = str.match(/([0-9]+)([px|%]*)/)
  const value = +(tokens?.[1] || 0)
  const unit = tokens?.[2] || ''
  return toPx(value, unit, size)
}

export function removeNullChildren(children: React.ReactElement[]) {
  return React.Children.toArray(children).filter(c => c)
}
