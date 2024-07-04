import Store from '../Store'
import {drawTexture, m4, rgba, ThisWebGLContext} from '../base'
import {Property} from '../base/transforms'
import Texture from '../base/webgl/Texture'
import {FrameInfo, LayerEllipseProps, LayerPathProps, LayerRectProps} from '../types'
import AbstractDrawer from './AbstractDrawer'

const LineCap: CanvasLineCap[] = ['butt', 'round', 'square']
const LineJoin: CanvasLineJoin[] = ['bevel', 'miter', 'round']

export default abstract class ElementDrawer<
  Props extends LayerRectProps | LayerEllipseProps | LayerPathProps,
> extends AbstractDrawer<Props> {
  private texture?: Texture
  private _ctx: OffscreenCanvasRenderingContext2D | null = null
  private _lineDashOffset?: Property<number>
  private _lastDashOffset = 0

  async init(gl: ThisWebGLContext) {
    this.texture = new Texture(gl)

    const strokeInfo = this.props.elements.strokeInfo
    if (strokeInfo?.dashesInfo) {
      this._lineDashOffset = new Property<number>(strokeInfo.dashesInfo.offset)
    }
  }

  draw(gl: ThisWebGLContext, matrix: m4.Mat4, frameInfo: FrameInfo) {
    if (!this.texture) return

    this.drawShape(gl, frameInfo)

    gl.activeTexture(gl.TEXTURE0)
    this.texture.bind()
    gl.uniformMatrix4fv(gl.uniforms.matrix, false, matrix)

    const width = this.width
    const height = this.height
    drawTexture(this.getAttribBuffer(gl), width, height)

    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  destroy(): void {
    super.destroy()

    this.texture?.destroy()
    this.texture = undefined
    this._ctx = null
  }

  protected abstract getDrawPath(ctx: OffscreenCanvasRenderingContext2D): Path2D | null

  private drawShape(gl: ThisWebGLContext, frameInfo: FrameInfo) {
    const width = this.width
    const height = this.height
    let hasTexture = true
    if (!this._ctx) {
      const canvas = new OffscreenCanvas(width, height)
      this._ctx = canvas.getContext('2d')
      hasTexture = false
    }
    if (!this._ctx) return

    const lineDashOffset = (this._lineDashOffset?.getValue(frameInfo.frameId) || 0) as number

    if (!hasTexture || lineDashOffset !== this._lastDashOffset) {
      this._lastDashOffset = lineDashOffset
      this._ctx?.clearRect(0, 0, width, height)

      // 设置参数
      const fillInfo = this.props.elements.fillInfo
      if (fillInfo) {
        this._ctx.fillStyle = rgba(fillInfo.color, fillInfo.opacity)
      }
      const strokeInfo = this.props.elements.strokeInfo
      if (strokeInfo) {
        this._ctx.strokeStyle = rgba(strokeInfo.color, strokeInfo.opacity)
        this._ctx.lineCap = LineCap[strokeInfo.lineCap]
        this._ctx.lineWidth = strokeInfo.width
        this._ctx.lineJoin = LineJoin[strokeInfo.lineJoin]
        this._ctx.miterLimit = strokeInfo.miterLimit
        if (strokeInfo.dashesInfo) {
          this._ctx.setLineDash(strokeInfo.dashesInfo.dash)
          const dashOffset = (this._lineDashOffset?.getValue(frameInfo.frameId) || 0) as number
          this._ctx.lineDashOffset = dashOffset
        }
      }

      const path = this.getDrawPath(this._ctx)
      if (fillInfo) {
        path ? this._ctx.fill(path) : this._ctx.fill()
      }
      if (strokeInfo) {
        path ? this._ctx.stroke(path) : this._ctx.stroke()
      }

      this.texture?.texImage2D(this._ctx.canvas as any)
    }
  }
}
