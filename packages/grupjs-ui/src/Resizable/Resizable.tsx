import React, {ReactElement} from 'react'
import DraggableCore, {DraggableData, DraggableEventHandler} from '../Draggable'
import './index.css'

export type Axis = 'both' | 'x' | 'y' | 'none'
export type ResizeHandleAxis = 's' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'
export interface ResizeCallbackData {
  node: HTMLElement
  size: {width: number; height: number}
  handle: ResizeHandleAxis
}

export interface ResizableDefaultProps {
  axis: Axis
  lockAspectRatio: boolean
  minConstraints: [number, number]
  maxConstraints: [number, number]
  resizeHandles: ResizeHandleAxis[]
}
export type ResizableProps = Partial<ResizableDefaultProps> & {
  children: ReactElement
  handle?: ReactElement | ((resizeHandleAxis: ResizeHandleAxis, ref: React.RefObject<HTMLElement>) => ReactElement<any>)
  width: number
  height: number
  className?: string
  onResizeStop?: (e: MouseEvent, data: ResizeCallbackData) => any
  onResizeStart?: (e: MouseEvent, data: ResizeCallbackData) => any
  onResize?: (e: MouseEvent, data: ResizeCallbackData) => any
}

export default class Resizable extends React.Component<ResizableProps> {
  handleRefs: Partial<Record<ResizeHandleAxis, React.RefObject<HTMLElement>>> = {}
  lastHandleRect: ClientRect | undefined = undefined
  slack: [number, number] | undefined = undefined

  static defaultProps: ResizableDefaultProps = {
    axis: 'both',
    lockAspectRatio: false,
    minConstraints: [20, 20],
    maxConstraints: [Infinity, Infinity],
    resizeHandles: ['se'],
  }

  componentWillUnmount() {
    this.resetData()
  }

  resetData() {
    this.lastHandleRect = this.slack = undefined
  }

  runConstraints(width: number, height: number): [number, number] {
    const {minConstraints, maxConstraints, lockAspectRatio} = this.props
    if (!minConstraints && !maxConstraints && !lockAspectRatio) return [width, height]

    if (lockAspectRatio) {
      const ratio = this.props.width / this.props.height
      const deltaW = width - this.props.width
      const deltaH = height - this.props.height

      if (Math.abs(deltaW) > Math.abs(deltaH * ratio)) {
        height = width / ratio
      } else {
        width = height * ratio
      }
    }

    const [oldW, oldH] = [width, height]
    const [slackW, slackH] = this.slack || [0, 0]
    width += slackW
    height += slackH

    if (minConstraints) {
      width = Math.max(minConstraints[0], width)
      height = Math.max(minConstraints[1], height)
    }
    if (maxConstraints) {
      width = Math.min(maxConstraints[0], width)
      height = Math.min(maxConstraints[1], height)
    }

    this.slack = [slackW + (oldW - width), slackH + (oldH - height)]

    return [width, height]
  }

  resizeHandler(
    handlerName: 'onResize' | 'onResizeStart' | 'onResizeStop',
    axis: ResizeHandleAxis,
  ): DraggableEventHandler {
    return (ev: MouseEvent, {node, deltaX, deltaY}: DraggableData) => {
      if (handlerName === 'onResizeStart') this.resetData()

      const canDragX = (this.props.axis === 'both' || this.props.axis === 'x') && axis !== 'n' && axis !== 's'
      const canDragY = (this.props.axis === 'both' || this.props.axis === 'y') && axis !== 'e' && axis !== 'w'
      if (!canDragX && !canDragY) return

      const axisV = axis[0]
      const axisH = axis[axis.length - 1]

      const handleRect = node.getBoundingClientRect()
      if (this.lastHandleRect !== undefined) {
        if (axisH === 'w') {
          const deltaLeftSinceLast = handleRect.left - this.lastHandleRect.left
          deltaX += deltaLeftSinceLast
        }
        if (axisV === 'n') {
          const deltaTopSinceLast = handleRect.top - this.lastHandleRect.top
          deltaY += deltaTopSinceLast
        }
      }
      this.lastHandleRect = handleRect

      if (axisH === 'w') deltaX = -deltaX
      if (axisV === 'n') deltaY = -deltaY

      let width = this.props.width + (canDragX ? deltaX : 0)
      let height = this.props.height + (canDragY ? deltaY : 0)
      ;[width, height] = this.runConstraints(width, height)

      const dimensionsChanged = width !== this.props.width || height !== this.props.height

      const cb = typeof this.props[handlerName] === 'function' ? this.props[handlerName] : null
      const shouldSkipCb = handlerName === 'onResize' && !dimensionsChanged
      if (cb && !shouldSkipCb) {
        cb(ev, {node, size: {width, height}, handle: axis})
      }

      if (handlerName === 'onResizeStop') this.resetData()
    }
  }

  renderResizeHandle(handleAxis: ResizeHandleAxis, ref: React.RefObject<HTMLElement>) {
    const {handle} = this.props
    if (!handle) {
      return <span className={`react-resizable-handle react-resizable-handle-${handleAxis}`} ref={ref}></span>
    }
    if (typeof handle === 'function') {
      return handle(handleAxis, ref)
    }
    const isDomeElement = typeof handle.type === 'string'
    const props = {
      ref,
      ...(isDomeElement ? {} : {handleAxis}),
    }
    return React.cloneElement(handle, props)
  }

  render() {
    const {
      axis,
      lockAspectRatio,
      minConstraints,
      maxConstraints,
      resizeHandles,
      children,
      handle,
      width,
      height,
      className,
      onResizeStop,
      onResizeStart,
      onResize,
      ...p
    } = this.props
    return React.cloneElement(children, {
      ...p,
      className: `${className ? `${className} ` : ''}react-resizable`,
      children: [
        ...children.props.children,
        ...(resizeHandles as ResizeHandleAxis[]).map(handleAxis => {
          const ref = this.handleRefs[handleAxis] ?? (this.handleRefs[handleAxis] = React.createRef<HTMLElement>())
          return (
            <DraggableCore
              key={`resizableHandle-${handleAxis}`}
              nodeRef={ref}
              onStop={this.resizeHandler('onResizeStop', handleAxis)}
              onStart={this.resizeHandler('onResizeStart', handleAxis)}
              onDrag={this.resizeHandler('onResize', handleAxis)}>
              {this.renderResizeHandle(handleAxis, ref)}
            </DraggableCore>
          )
        }),
      ],
    })
  }
}
