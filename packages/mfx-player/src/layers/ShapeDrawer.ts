import {drawTexture, Framebuffer, ThisWebGLContext} from '../base'
import {m4} from '../base'
import Store from '../render/Store'
import {FrameInfo, LayerEllipseProps, LayerPathProps, LayerRectProps, LayerShapeProps, LayerType} from '../types'
import AbstractDrawer from './AbstractDrawer'
import EllipseDrawer from './EllipseDrawer'
import Layer from './Layer'
import PathDrawer from './PathDrawer'
import RectDrawer from './RectDrawer'

export default class ShapeDrawer extends AbstractDrawer<LayerShapeProps> {
  constructor(props: LayerShapeProps, store: Store, parentWidth: number, parentHeight: number) {
    super(props, store, parentWidth, parentHeight)

    this._cameraMatrix = m4.centerCamera(this.width, this.height)
  }

  private _subLayers?: Layer[]
  private _viewFramebuffer: Framebuffer | null = null
  private _cameraMatrix: m4.Mat4

  async init(gl: ThisWebGLContext) {
    const shapeElements = this.props.content
    if (!shapeElements) return

    this._viewFramebuffer = new Framebuffer(gl)
    this._subLayers = []

    const width = this.width
    const height = this.height
    const inFrame = this.inFrame
    const outFrame = this.outFrame

    this.setAnchorOffXY(width * 0.5, height * 0.5)
    this.setMatrixCache()

    const subLayers = this._subLayers
    for (let i = shapeElements.length - 1; i >= 0; i--) {
      const element = shapeElements[i]
      let layer: Layer | null = null
      const props = {...element, inFrame, outFrame}
      if (element.type === LayerType.Rect) {
        layer = new Layer(new RectDrawer(props as LayerRectProps, this.store, width, height))
      } else if (element.type === LayerType.Ellipse) {
        layer = new Layer(new EllipseDrawer(props as LayerEllipseProps, this.store, width, height))
      } else if (element.type === LayerType.Path) {
        props.width = width
        props.height = height
        layer = new Layer(new PathDrawer(props as LayerPathProps, this.store, width, height))
      }
      if (!layer) continue
      subLayers.push(layer)
      await layer.init(gl)
    }
  }

  draw(gl: ThisWebGLContext, matrix: m4.Mat4, frameInfo: FrameInfo) {
    const framebuffer = this._viewFramebuffer
    const subLayers = this._subLayers
    if (!framebuffer || !subLayers || !subLayers.length) return

    const width = this.width
    const height = this.height
    const opacity = this.transform.getOpacity(frameInfo.frameId)

    framebuffer.bind()
    framebuffer.viewport(width, height)

    const viewFrameInfo = {...frameInfo, width: width, height: height, opacity, framebuffer}
    const cameraMatrix = this._cameraMatrix

    for (let i = 0, l = subLayers.length; i < l; i++) {
      const layer = subLayers[i]
      if (!layer.isShowTime(viewFrameInfo.frameId)) continue
      layer.render(gl, cameraMatrix, viewFrameInfo)
    }

    // 上屏
    const parentFramebuffer = frameInfo.framebuffer
    parentFramebuffer.bind()
    parentFramebuffer.viewport(frameInfo.width, frameInfo.height, true)

    gl.activeTexture(gl.TEXTURE0)
    framebuffer.texture?.bind()
    gl.uniform1f(gl.uniforms.opacity, opacity)
    gl.uniformMatrix4fv(gl.uniforms.matrix, false, matrix)

    drawTexture(this.getAttribBuffer(gl), width, height, true)

    // 释放
    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  destroy() {
    super.destroy()
    this._viewFramebuffer?.destory()
    this._viewFramebuffer = null

    this._subLayers?.forEach(el => el.destroy())
    this._subLayers = undefined
  }
}
