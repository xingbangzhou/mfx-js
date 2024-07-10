import {ThisWebGLContext} from '../base'
import Store from '../render/Store'
import {LayerRectProps} from '../types'
import ElementDrawer from './ElementDrawer'

function drawRoundedRect(ctx: OffscreenCanvasRenderingContext2D, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.lineTo(width - radius, 0)
  ctx.arcTo(width, 0, width, 0 + radius, radius)
  ctx.lineTo(width, 0 + height - radius)
  ctx.arcTo(width, 0 + height, width - radius, 0 + height, radius)
  ctx.lineTo(radius, 0 + height)
  ctx.arcTo(0, 0 + height, 0, 0 + height - radius, radius)
  ctx.lineTo(0, 0 + radius)
  ctx.arcTo(0, 0, radius, 0, radius)
  ctx.closePath()
}

export default class RectDrawer extends ElementDrawer<LayerRectProps> {
  constructor(props: LayerRectProps, store: Store, shapeWidth: number, shapeHeight: number) {
    super(props, store, shapeWidth, shapeHeight)
    const width = (this.props.width = props.elements.rectInfo.size[0] || 0)
    const height = (this.props.height = props.elements.rectInfo.size[1] || 0)

    const offX = this.props.elements?.rectInfo?.position?.[0] || 0
    const offY = this.props.elements?.rectInfo?.position?.[1] || 0
    this.setAnchorOffXY(width * 0.5 + offX, height * 0.5 + offY)
    this.setOffXY(shapeWidth * 0.5, shapeHeight * 0.5)
  }

  async init(gl: ThisWebGLContext) {
    super.init(gl)

    this.setMatrixCache()
  }

  protected getDrawPath(ctx: OffscreenCanvasRenderingContext2D) {
    const width = this.width
    const height = this.height

    const path = new Path2D()
    const rectInfo = this.props.elements.rectInfo
    let radius = rectInfo?.roundness || 0
    if (radius > 0) {
      if (radius > height * 0.5) {
        radius = Math.floor(height * 0.5)
      }
      if ('roundRect' in path) {
        ;(path as any)['roundRect'](0, 0, width, height, radius)
      } else {
        drawRoundedRect(ctx, width, height, radius)
        return null
      }
    } else {
      path.rect(0, 0, width, height)
    }

    return path
  }
}
