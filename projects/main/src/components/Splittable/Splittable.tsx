import React, {ReactElement, ReactNode} from 'react'
import './index.scss'
import {convert, convertToUnit, getUnit, removeNullChildren, SplitType} from './_fns'
import SplitPane from './SplitPane'
import SplitResizer from './SplitResizer'

const DEFAULT_PANE_SIZE = '1'
const DEFAULT_PANE_MIN_SIZE = '0'
const DEFAULT_PANE_MAX_SIZE = '100%'

interface SplittableDefaultProps {
  split?: SplitType
  allowResize?: boolean
}

export type SplittableProps = SplittableDefaultProps & {
  children: ReactNode
  className?: string
  id?: string
  onChange?: (sizes: string[]) => void
  onResizeStart?: () => void
  onResizeEnd?: (sizes: string[] | undefined) => void
}

interface SplittableState {
  sizes?: string[]
  prevPropsChildren?: ReactNode
}

function getPanePropSize(props: SplittableProps) {
  return removeNullChildren(props.children as any).map((child: any) => {
    const value = child['props']['size'] || child['props']['initialSize']
    if (value === undefined) {
      return DEFAULT_PANE_SIZE
    }

    return String(value)
  })
}

export default class Splittable extends React.Component<SplittableProps, SplittableState> {
  static displayName = 'Splittable'

  static defaultProps: SplittableDefaultProps = {
    split: 'vertical',
    allowResize: true,
  }

  state: SplittableState

  splitLayout: HTMLDivElement | null = null
  paneElements: HTMLDivElement[] = []
  resizerIndex = NaN
  dimensionsSnapshot = {
    paneDimensions: Array<DOMRect>(),
    splitPaneSizePx: 0,
    minSizesPx: Array<number>(),
    maxSizesPx: Array<number>(),
    sizesPx: Array<number>(),
  }
  startClientX = NaN
  startClientY = NaN

  constructor(props: SplittableProps) {
    super(props)

    this.state = {
      sizes: undefined,
      prevPropsChildren: props.children,
    }
  }

  static getDerivedStateFromProps({children}: SplittableProps, {prevPropsChildren}: SplittableState) {
    if (children !== prevPropsChildren) {
      return {
        sizes: undefined,
        prevPropsChildren: children,
      }
    }
    return null
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.onMouseUp)
    document.removeEventListener('mousemove', this.onMouseMove)
  }

  onMouseDown = (event: MouseEvent | React.MouseEvent, resizerIndex: number) => {
    if (event.button !== 0) {
      return
    }

    event.preventDefault()

    this.onDown(resizerIndex, event.clientX, event.clientY)
  }

  onDown = (resizerIndex: number, clientX: number, clientY: number) => {
    const {allowResize, onResizeStart} = this.props

    if (!allowResize) {
      return
    }

    this.resizerIndex = resizerIndex
    this.dimensionsSnapshot = this.getDimensionsSnapshot(this.props)
    this.startClientX = clientX
    this.startClientY = clientY

    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)

    onResizeStart?.()
  }

  onMouseMove = (event: MouseEvent) => {
    event.preventDefault()

    this.onMove(event.clientX, event.clientY)
  }

  onMouseUp = (event: MouseEvent) => {
    event.preventDefault()

    document.removeEventListener('mouseup', this.onMouseUp)
    document.removeEventListener('mousemove', this.onMouseMove)

    this.props.onResizeEnd?.(this.state.sizes)
  }

  getDimensionsSnapshot(props: SplittableProps) {
    const split = props.split
    const paneDimensions = this.getPaneDimensions()
    const splitPaneDimensions = (this.splitLayout as HTMLDivElement).getBoundingClientRect()
    const minSizes = this.getPanePropMinMaxSize(props, 'minSize')
    const maxSizes = this.getPanePropMinMaxSize(props, 'maxSize')

    const splitPaneSizePx = split === 'vertical' ? splitPaneDimensions.width : splitPaneDimensions.height

    const minSizesPx = minSizes.map(s => convert(s, splitPaneSizePx))
    const maxSizesPx = maxSizes.map(s => convert(s, splitPaneSizePx))
    const sizesPx = paneDimensions.map(d => (split === 'vertical' ? d.width : d.height))

    return {
      paneDimensions,
      splitPaneSizePx,
      minSizesPx,
      maxSizesPx,
      sizesPx,
    }
  }

  getPanePropMinMaxSize(props: SplittableProps, key: string) {
    return removeNullChildren(props.children as any).map(child => {
      const value = (child as any).props[key]
      if (value === undefined) {
        return key === 'maxSize' ? DEFAULT_PANE_MAX_SIZE : DEFAULT_PANE_MIN_SIZE
      }

      return value
    })
  }

  getPaneDimensions() {
    return this.paneElements.filter(el => el).map(el => el.getBoundingClientRect())
  }

  getSizes() {
    const sizes = getPanePropSize(this.props)
    if (!this.state.sizes) {
      return sizes
    }
    return this.state.sizes
  }

  onMove(clientX: number, clientY: number) {
    const {split, onChange} = this.props
    const resizerIndex = this.resizerIndex
    const {sizesPx, minSizesPx, maxSizesPx, splitPaneSizePx, paneDimensions} = this.dimensionsSnapshot

    const sizeDim = split === 'vertical' ? 'width' : 'height'
    const primary = paneDimensions[resizerIndex]
    const secondary = paneDimensions[resizerIndex + 1]
    const maxSize = primary[sizeDim] + secondary[sizeDim]

    const primaryMinSizePx = minSizesPx[resizerIndex]
    const secondaryMinSizePx = minSizesPx[resizerIndex + 1]
    const primaryMaxSizePx = Math.min(maxSizesPx[resizerIndex], maxSize)
    const secondaryMaxSizePx = Math.min(maxSizesPx[resizerIndex + 1], maxSize)

    const moveOffset = split === 'vertical' ? this.startClientX - clientX : this.startClientY - clientY
    let primarySizePx = primary[sizeDim] - moveOffset
    let secondarySizePx = secondary[sizeDim] + moveOffset

    let primaryHasReachedLimit = false
    let secondaryHasReachedLimit = false

    if (primarySizePx < primaryMinSizePx) {
      primarySizePx = primaryMinSizePx
      primaryHasReachedLimit = true
    } else if (primarySizePx > primaryMaxSizePx) {
      primarySizePx = primaryMaxSizePx
      primaryHasReachedLimit = true
    }

    if (secondarySizePx < secondaryMinSizePx) {
      secondarySizePx = secondaryMinSizePx
      secondaryHasReachedLimit = true
    } else if (secondarySizePx > secondaryMaxSizePx) {
      secondarySizePx = secondaryMaxSizePx
      secondaryHasReachedLimit = true
    }

    if (primaryHasReachedLimit) {
      secondarySizePx = primary[sizeDim] + secondary[sizeDim] - primarySizePx
    } else if (secondaryHasReachedLimit) {
      primarySizePx = primary[sizeDim] + secondary[sizeDim] - secondarySizePx
    }

    sizesPx[resizerIndex] = primarySizePx
    sizesPx[resizerIndex + 1] = secondarySizePx

    let sizes = this.getSizes().concat()
    let updateRatio = false
    ;[primarySizePx, secondarySizePx].forEach((paneSize, idx) => {
      const unit = getUnit(sizes[resizerIndex + idx])
      if (unit !== 'ratio') {
        sizes[resizerIndex + idx] = convertToUnit(paneSize, unit, splitPaneSizePx)
      } else {
        updateRatio = true
      }
    })

    if (updateRatio) {
      let ratioCount = 0
      let lastRatioIdx = -1
      sizes = sizes.map((size, idx) => {
        if (getUnit(size) === 'ratio') {
          ratioCount++
          lastRatioIdx = idx
          return convertToUnit(sizesPx[idx], 'ratio')
        }
        return size
      })

      if (ratioCount === 1) {
        sizes[lastRatioIdx] = '1'
      }
    }
    this.setState({
      sizes,
    })
    onChange?.(sizes)
  }

  setPaneRef = (idx: number, el: HTMLDivElement) => {
    this.paneElements[idx] = el
  }

  render() {
    const {children, className, split, id} = this.props
    const notNullChildren = removeNullChildren(children as any)
    const sizes = this.getSizes()
    const elements = notNullChildren.reduce((acc: React.ReactNode[], child, idx) => {
      const isPane = (child as any)['type'] === SplitPane
      const paneProps = {
        type: split,
        key: (child as ReactElement).props?.id || `Pane-${idx}`,
        innerRef: this.setPaneRef.bind(this, idx),
        size: sizes[idx],
      }
      let pane: React.ReactNode
      if (isPane) {
        pane = React.cloneElement(child as ReactElement, paneProps)
      } else {
        pane = <SplitPane {...paneProps}>{child}</SplitPane>
      }
      const resizerIndex = idx - 1
      if (acc['length'] === 0) {
        return [...acc, pane]
      } else {
        const resizer = (
          <SplitResizer
            index={resizerIndex}
            key={`Resizer-${resizerIndex}`}
            split={split}
            onMouseDown={this.onMouseDown}
          />
        )

        return [...acc, resizer, pane]
      }
    }, [])

    return (
      <div
        id={id}
        className={`splittable splittable-${split === 'vertical' ? 'r' : 'c'} ${className ? ' ' + className : ''}`}
        ref={el => {
          this.splitLayout = el
        }}
      >
        {elements}
      </div>
    )
  }
}
