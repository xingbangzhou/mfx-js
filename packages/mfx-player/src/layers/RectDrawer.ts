import PlayContext from '../render/RenderStore'
import {ThisWebGLContext} from '../base'
import {LayerRectProps} from '../types'
import ElementDrawer from './ElementDrawer'

export default class RectDrawer extends ElementDrawer<LayerRectProps> {
  constructor(props: LayerRectProps, playContext: PlayContext) {
    super(props, playContext)
    this.props.width = props.elements.rectInfo.size[0] || 0
    this.props.height = props.elements.rectInfo.size[1] || 0
  }

  async init(gl: ThisWebGLContext) {
    super.init(gl)

    const width = (this.props.width = this.props.elements.rectInfo.size[0] || 0)
    const height = (this.props.height = this.props.elements.rectInfo.size[1] || 0)

    // x、y的偏移值
    const offX = this.props.elements?.rectInfo?.position?.[0] || 0
    const offY = this.props.elements?.rectInfo?.position?.[1] || 0
    this.setAnchorOffXY(width * 0.5 - offX, height * 0.5 - offY)
    this.setOffXY(offX, offY)
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
      path.roundRect(0, 0, width, height, radius)
    } else {
      path.rect(0, 0, width, height)
    }

    return path
  }
}
