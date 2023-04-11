import React, {createRef} from 'react'
import DraggableCore, {
  DraggableCoreDefaultProps,
  DraggableCoreProps,
  DraggableData,
  DraggableEventHandler,
} from './DraggableCore'
import {ControlPosition, getTranslation, OffsetPosition, Bounds, getBoundPosition} from './domFns'

interface DraggableState {
  dragging: boolean
  dragged: boolean
  x: number
  y: number
  slackX: number
  slackY: number
  prevPropsPosition?: ControlPosition
}

export type DraggableDefaultProps = DraggableCoreDefaultProps & {
  axis: 'both' | 'x' | 'y' | 'none'
  bounds: Bounds | string | false
  defaultPosition: ControlPosition
}

export type DraggableProps = DraggableDefaultProps &
  DraggableCoreProps & {
    position?: ControlPosition
    positionOffset?: OffsetPosition
  }

function canDragX(draggable: Draggable): boolean {
  return draggable.props.axis === 'both' || draggable.props.axis === 'x'
}

function canDragY(draggable: Draggable): boolean {
  return draggable.props.axis === 'both' || draggable.props.axis === 'y'
}

export default class Draggable extends React.Component<DraggableProps, DraggableState> {
  static displayName = 'Draggable'

  static defaultProps: DraggableDefaultProps = {
    ...DraggableCore.defaultProps,
    axis: 'both',
    bounds: 'parent',
    defaultPosition: {x: 0, y: 0},
  }

  static getDerivedStateFromProps({position}: DraggableProps, {prevPropsPosition}: DraggableState) {
    if (position && (!prevPropsPosition || position.x !== prevPropsPosition.x || position.y !== prevPropsPosition.y)) {
      return {
        x: position.x,
        y: position.y,
        prevPropsPosition: {...position},
      }
    }
    return null
  }

  contentRef = createRef<HTMLElement>()

  constructor(props: DraggableProps) {
    super(props)
    this.state = {
      dragging: false,
      dragged: false,

      x: props.position ? props.position.x : props.defaultPosition.x,
      y: props.position ? props.position.y : props.defaultPosition.y,

      prevPropsPosition: props.position,

      slackX: 0,
      slackY: 0,
    }
  }

  componentDidMount() {}

  componentWillUnmount() {
    this.setState({dragging: false})
  }

  get node() {
    return this.props.nodeRef?.current ?? this.contentRef.current
  }

  onDragStart: DraggableEventHandler = (ev, coreData) => {
    const shouldStart = this.props.onStart(ev, this.createDraggableData(coreData))
    if (shouldStart === false) return false

    this.setState({dragging: true, dragged: true})

    return
  }

  onDrag: DraggableEventHandler = (ev, coreData) => {
    if (!this.state.dragging) return false

    const uiData = this.createDraggableData(coreData)

    const newState: any = {
      x: uiData.x,
      y: uiData.y,
    }

    if (this.props.bounds) {
      const {x, y} = newState

      newState.x += this.state.slackX
      newState.y += this.state.slackY
      // Get bound position. This will ceil/floor the x and y within the boundaries.
      const [newStateX, newStateY] = getBoundPosition(
        this.node as HTMLElement,
        newState.x,
        newState.y,
        this.props.bounds,
      ) as [number, number]
      newState.x = newStateX
      newState.y = newStateY

      // Recalculate slack by noting how much was shaved by the boundPosition handler.
      newState.slackX = this.state.slackX + (x - newState.x)
      newState.slackY = this.state.slackY + (y - newState.y)

      // Update the event we fire to reflect what really happened after bounds took effect.
      uiData.x = newState.x
      uiData.y = newState.y
      uiData.deltaX = newState.x - this.state.x
      uiData.deltaY = newState.y - this.state.y
    }

    const shouldUpdate = this.props.onDrag(ev, uiData)
    if (shouldUpdate === false) return false

    this.setState(newState)

    return
  }

  onDragStop: DraggableEventHandler = (ev, coreData) => {
    if (!this.state.dragging) return false

    // Short-circuit if user's callback killed it.
    const shouldContinue = this.props.onStop(ev, this.createDraggableData(coreData))
    if (shouldContinue === false) return false

    const newState: any = {
      dragging: false,
      slackX: 0,
      slackY: 0,
    }

    // If this is a controlled component, the result of this operation will be to
    // revert back to the old position. We expect a handler on `onDragStop`, at the least.
    if (this.props.position) {
      const {x, y} = this.props.position
      newState.x = x
      newState.y = y
    }

    this.setState(newState)

    return
  }

  private createDraggableData(coreData: DraggableData) {
    return {
      node: coreData.node,
      x: this.state.x + coreData.deltaX,
      y: this.state.y + coreData.deltaY,
      deltaX: coreData.deltaX,
      deltaY: coreData.deltaY,
      lastX: this.state.x,
      lastY: this.state.y,
    }
  }

  render() {
    const {children, defaultPosition, position, positionOffset, ...draggableCoreProps} = this.props

    const controlled = Boolean(position)
    const draggable = !controlled || this.state.dragging

    const validPosition = position || defaultPosition
    const transformOpts = {
      // Set left if horizontal drag is enabled
      x: canDragX(this) && draggable ? this.state.x : validPosition.x,

      // Set top if vertical drag is enabled
      y: canDragY(this) && draggable ? this.state.y : validPosition.y,
    }
    const style: React.CSSProperties = {
      transform: getTranslation(transformOpts, positionOffset),
    }

    const Core = DraggableCore as any
    return (
      <Core {...draggableCoreProps} onStart={this.onDragStart} onDrag={this.onDrag} onStop={this.onDragStop}>
        {React.cloneElement(React.Children.only(children), {
          style: {...children.props.style, ...style},
          ref: this.contentRef,
        })}
      </Core>
    )
  }
}
