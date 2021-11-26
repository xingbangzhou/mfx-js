import {int} from './shims'

export interface ControlPosition {
  x: number
  y: number
}

export interface OffsetPosition {
  x: number | string
  y: number | string
}

export interface Bounds {
  left: number
  top: number
  right: number
  bottom: number
}

function cloneBounds(bounds: Bounds): Bounds {
  return {
    left: bounds.left,
    top: bounds.top,
    right: bounds.right,
    bottom: bounds.bottom,
  }
}

export function outerHeight(node: HTMLElement): number {
  let height = node.clientHeight
  const computedStyle = node.ownerDocument.defaultView?.getComputedStyle(node) as CSSStyleDeclaration
  height += int(computedStyle.borderTopWidth)
  height += int(computedStyle.borderBottomWidth)
  return height
}

export function outerWidth(node: HTMLElement): number {
  let width = node.clientWidth
  const computedStyle = node.ownerDocument.defaultView?.getComputedStyle(node) as CSSStyleDeclaration
  width += int(computedStyle.borderLeftWidth)
  width += int(computedStyle.borderRightWidth)
  return width
}

export function innerHeight(node: HTMLElement): number {
  let height = node.clientHeight
  const computedStyle = node.ownerDocument.defaultView?.getComputedStyle(node) as CSSStyleDeclaration
  height -= int(computedStyle.paddingTop)
  height -= int(computedStyle.paddingBottom)
  return height
}

export function innerWidth(node: HTMLElement): number {
  let width = node.clientWidth
  const computedStyle = node.ownerDocument.defaultView?.getComputedStyle(node) as CSSStyleDeclaration
  width -= int(computedStyle.paddingLeft)
  width -= int(computedStyle.paddingRight)
  return width
}

export function offsetXYFromParent(
  clientX: number,
  clientY: number,
  offsetParent?: HTMLElement,
): ControlPosition | undefined {
  if (!offsetParent) return undefined
  const isBody = offsetParent === offsetParent.ownerDocument.body
  const offsetParentRect = isBody ? {left: 0, top: 0} : offsetParent.getBoundingClientRect()
  const x = clientX - offsetParentRect.left + offsetParent.scrollLeft
  const y = clientY - offsetParentRect.top + offsetParent.scrollTop

  return {x, y}
}

export function getTranslation({x, y}: ControlPosition, positionOffset?: OffsetPosition, unitSuffix = 'px') {
  let translation = `translate(${x}${unitSuffix},${y}${unitSuffix})`
  if (positionOffset) {
    const defaultX = `${typeof positionOffset.x === 'string' ? positionOffset.x : positionOffset.x + unitSuffix}`
    const defaultY = `${typeof positionOffset.y === 'string' ? positionOffset.y : positionOffset.y + unitSuffix}`
    translation = `translate(${defaultX}, ${defaultY})` + translation
  }
  return translation
}

export function addDomEvent(el: Node, event: string, handler: Function, inputOptions?: AddEventListenerOptions) {
  if (!el) return
  const options = {capture: true, ...inputOptions}
  if (el.addEventListener) {
    el.addEventListener(event, handler as any, options)
  } else if ((el as any).attachEvent) {
    ;(el as any).attachEvent('on' + event, handler)
  } else {
    ;(el as any)[`on${event}`] = handler
  }
}

export function removeDomEvent(
  el: Node,
  event: string,
  handler: Function,
  inputOptions?: AddEventListenerOptions,
): void {
  if (!el) return
  const options = {capture: true, ...inputOptions}
  if (el.removeEventListener) {
    el.removeEventListener(event, handler as any, options)
  } else if ((el as any).detachEvent) {
    ;(el as any).detachEvent('on' + event, handler)
  } else {
    ;(el as any)[`on${event}`] = null
  }
}

export function matchesSelector(el: HTMLElement, selector: string, baseNode: HTMLElement): boolean {
  let node: HTMLElement | null = el
  do {
    if (node.matches(selector)) return true
    if (node === baseNode) return false
    node = node.parentElement
  } while (node)

  return false
}

export function getBoundPosition(
  node: HTMLElement,
  x: number,
  y: number,
  bounds: Bounds | string = 'parent', // or selector
): [number, number] | undefined {
  bounds = typeof bounds === 'string' ? bounds : cloneBounds(bounds)

  if (typeof bounds === 'string') {
    const {ownerDocument} = node
    const ownerWindow = ownerDocument.defaultView as WindowProxy & typeof globalThis
    let boundNode
    if (bounds === 'parent') {
      boundNode = node.parentNode
    } else {
      boundNode = ownerDocument.querySelector(bounds)
    }
    if (!(boundNode instanceof ownerWindow.HTMLElement)) {
      return undefined
    }
    const boundNodeEl: HTMLElement = boundNode // for Flow, can't seem to refine correctly
    const nodeStyle = ownerWindow.getComputedStyle(node)
    const boundNodeStyle = ownerWindow.getComputedStyle(boundNodeEl)
    // Compute bounds. This is a pain with padding and offsets but this gets it exactly right.
    bounds = {
      left: -node.offsetLeft + int(boundNodeStyle.paddingLeft) + int(nodeStyle.marginLeft),
      top: -node.offsetTop + int(boundNodeStyle.paddingTop) + int(nodeStyle.marginTop),
      right:
        innerWidth(boundNodeEl) -
        outerWidth(node) -
        node.offsetLeft +
        int(boundNodeStyle.paddingRight) -
        int(nodeStyle.marginRight),
      bottom:
        innerHeight(boundNodeEl) -
        outerHeight(node) -
        node.offsetTop +
        int(boundNodeStyle.paddingBottom) -
        int(nodeStyle.marginBottom),
    }
  }
  // Keep x and y below right and bottom limits...
  x = Math.min(x, bounds.right)
  y = Math.min(y, bounds.bottom)

  // But above left and top limits.
  x = Math.max(x, bounds.left)
  y = Math.max(y, bounds.top)

  return [x, y]
}
