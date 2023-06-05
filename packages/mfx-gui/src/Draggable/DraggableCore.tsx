import React, {createRef, ReactNode} from 'react'
import {matchesSelector, offsetXYFromParent, addDomEvent, removeDomEvent} from './domFns'

export interface DraggableData {
  node: HTMLElement
  x: number
  y: number
  deltaX: number
  deltaY: number
  lastX: number
  lastY: number
}

export type DraggableEventHandler = (e: MouseEvent, data: DraggableData) => void | false

export interface DraggableCoreDefaultProps {
  onStart: DraggableEventHandler
  onDrag: DraggableEventHandler
  onStop: DraggableEventHandler
  onMouseDown: (e: MouseEvent) => void
}

export type DraggableCoreProps = {
  children: React.ReactElement
  nodeRef?: React.RefObject<HTMLElement>
  disable?: boolean
  handle?: string
  offsetParent?: HTMLElement
} & DraggableCoreDefaultProps

interface DraggableCoreState {
  dragging: boolean
  lastX: number
  lastY: number
}

const eventsFor = {
  mouse: {
    start: 'mousedown',
    move: 'mousemove',
    stop: 'mouseup',
  },
}

export default class DraggableCore extends React.Component<DraggableCoreProps, DraggableCoreState> {
  static displayName = 'DraggableCore'

  static defaultProps: DraggableCoreDefaultProps = {
    onStart: function () {},
    onDrag: function () {},
    onStop: function () {},
    onMouseDown: function () {},
  }

  state: DraggableCoreState = {
    dragging: false,
    lastX: NaN,
    lastY: NaN,
  }

  contentRef = createRef<HTMLElement>()

  mounted = false

  componentDidMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
    if (this.node) {
      const {ownerDocument} = this.node
      removeDomEvent(ownerDocument, eventsFor.mouse.move, this.handleDrag as EventListener)
      removeDomEvent(ownerDocument, eventsFor.mouse.stop, this.handleDragStop as EventListener)
    }
  }

  get node() {
    return this.props.nodeRef?.current ?? this.contentRef.current
  }

  private handleDragStart = (ev: MouseEvent) => {
    this.props.onMouseDown(ev)
    if (!this.node) return
    if (ev.button !== 0) return

    if (
      this.props.disable ||
      (this.props.handle && !matchesSelector(ev.target as HTMLElement, this.props.handle, this.node))
    ) {
      return
    }

    const position = this.getControlPosition(ev)
    if (!position) return
    const {x, y} = position
    const coreEvent = this.createCoreData(x, y)

    const shouldUpdate = this.props.onStart(ev, coreEvent)
    if (shouldUpdate === false || this.mounted === false) return

    this.setState({
      dragging: true,
      lastX: x,
      lastY: y,
    })

    const {ownerDocument} = this.node
    addDomEvent(ownerDocument, eventsFor.mouse.move, this.handleDrag as EventListener)
    addDomEvent(ownerDocument, eventsFor.mouse.stop, this.handleDragStop as EventListener)
  }

  private handleDrag = (ev: MouseEvent) => {
    const position = this.getControlPosition(ev)
    if (!position) return
    const {x, y} = position
    const coreEvent = this.createCoreData(x, y)

    const shouldUpdate = this.props.onDrag(ev, coreEvent)
    if (shouldUpdate === false || this.mounted === false) {
      try {
        this.handleDragStop(new MouseEvent('mouseup'))
      } catch (err) {
        // Old browsers
        const event = document.createEvent('MouseEvents')
        // I see why this insanity was deprecated
        event.initMouseEvent('mouseup', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        this.handleDragStop(event)
      }
      return
    }

    this.setState({
      lastX: x,
      lastY: y,
    })
  }

  private handleDragStop = (ev: MouseEvent) => {
    if (!this.state.dragging) return

    const position = this.getControlPosition(ev)
    if (!position) return
    const {x, y} = position
    const coreEvent = this.createCoreData(x, y)

    const shouldContinue = this.props.onStop(ev, coreEvent)
    if (shouldContinue === false || this.mounted === false) return

    this.setState({
      dragging: false,
      lastX: NaN,
      lastY: NaN,
    })

    if (this.node) {
      removeDomEvent(this.node.ownerDocument, eventsFor.mouse.move, this.handleDrag as EventListener)
      removeDomEvent(this.node.ownerDocument, eventsFor.mouse.stop, this.handleDragStop as EventListener)
    }
  }

  private onMouseDown = (ev: MouseEvent) => {
    this.handleDragStart(ev)
  }

  private onMouseUp = (ev: MouseEvent) => {
    this.handleDragStop(ev)
  }

  private createCoreData(x: number, y: number): DraggableData {
    const isStart = !(typeof this.state.lastX === 'number' && !isNaN(this.state.lastX))

    if (isStart) {
      // If this is our first move, use the x and y as last coords.
      return {
        node: this.node as HTMLElement,
        deltaX: 0,
        deltaY: 0,
        lastX: x,
        lastY: y,
        x,
        y,
      }
    } else {
      // Otherwise calculate proper values.
      return {
        node: this.node as HTMLElement,
        deltaX: x - this.state.lastX,
        deltaY: y - this.state.lastY,
        lastX: this.state.lastX,
        lastY: this.state.lastY,
        x,
        y,
      }
    }
  }

  private getControlPosition(ev: MouseEvent) {
    if (!this.node) return undefined

    return offsetXYFromParent(
      ev.clientX,
      ev.clientY,
      (this.props.offsetParent || this.node.offsetParent || this.node.ownerDocument.body) as HTMLElement,
    )
  }

  render() {
    return React.cloneElement(React.Children.only(this.props.children as any), {
      onMouseDown: this.onMouseDown,
      onMouseUp: this.onMouseUp,
      ref: this.contentRef,
    })
  }
}
