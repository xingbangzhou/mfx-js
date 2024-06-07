import {ThisWebGLContext} from '../base'
import {LayerEllipseProps} from '../types'
import ElementDrawer from './ElementDrawer'

export default class EllipseDrawer extends ElementDrawer<LayerEllipseProps> {
  async init(gl: ThisWebGLContext) {
    super.init(gl)

    const width = (this.props.width = this.props.elements.ellipseInfo.size[0] || 0)
    const height = (this.props.height = this.props.elements.ellipseInfo.size[1] || 0)

    // x、y的偏移值
    const offX = this.props.elements?.ellipseInfo?.position?.[0] || 0
    const offY = this.props.elements?.ellipseInfo?.position?.[1] || 0
    this.setAnchorOffXY(width * 0.5 - offX, height * 0.5 - offY)
    this.setOffXY(offX, offY)
  }

  protected getDrawPath(ctx: OffscreenCanvasRenderingContext2D): Path2D {
    const width = this.width
    const height = this.height

    const path = new Path2D()
    const cx = width * 0.5
    const cy = height * 0.5
    path.ellipse(cx, cy, cx, cy, 0, 0, height)

    return path
  }
}
