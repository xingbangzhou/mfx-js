import {Framebuffer, ThisWebGLContext, drawTexture} from '../base'
import {m4} from '../base'
import {FrameInfo, LayerVectorProps} from '../types'
import AbstractDrawer from './AbstractDrawer'
import Layer, {createLayer} from './Layer'
import {setProgram} from './setPrograms'

export default class VectorDrawer extends AbstractDrawer<LayerVectorProps> {
  private _subLayers?: Layer[]
  private _viewFramebuffer: Framebuffer | null = null
  private _viewMatrix: m4.Mat4 = m4.identity()

  get subLayers() {
    return this._subLayers
  }

  async init(gl: ThisWebGLContext) {
    const width = this.width
    const height = this.height
    this._viewFramebuffer = new Framebuffer(gl)
    this._viewMatrix = m4.perspectiveCamera(width, height)

    // 子图层列表
    const viewInFrame = this.props.inFrame
    this._subLayers = []
    const layerPropss = this.props.layers
    if (layerPropss) {
      for (let i = layerPropss.length - 1; i >= 0; i--) {
        const props = layerPropss[i]
        const inFrame = props.inFrame + viewInFrame
        const outFrame = props.outFrame + viewInFrame
        // 遮罩过滤
        if (props.isTrackMatte) continue
        // 创建图层
        const layer = createLayer({...props, inFrame, outFrame}, this.store)
        if (!layer) continue
        await layer.init(gl, layerPropss)
        this._subLayers.push(layer)
      }
    }
  }

  draw(gl: ThisWebGLContext, matrix: m4.Mat4, frameInfo: FrameInfo) {
    const framebuffer = this._viewFramebuffer
    const subLayers = this._subLayers
    if (!framebuffer || !subLayers || !subLayers.length) return

    const width = this.width
    const height = this.height
    const opacity = this.transform.getOpacity(frameInfo.frameId)

    // 子图层渲染
    framebuffer.bind()
    framebuffer.viewport(width, height)

    const viewFrameInfo = {...frameInfo, width: width, height: height, opacity, framebuffer}
    const viewMatrix = this._viewMatrix

    for (let i = 0, l = subLayers.length; i < l; i++) {
      const layer = subLayers[i]
      if (!layer.verifyTime(viewFrameInfo.frameId)) continue
      layer.render(gl, viewMatrix, viewFrameInfo)
    }

    // 上屏
    const parentFramebuffer = frameInfo.framebuffer
    parentFramebuffer.bind()
    parentFramebuffer.viewport(frameInfo.width, frameInfo.height, true)

    setProgram(gl)
    gl.activeTexture(gl.TEXTURE0)
    framebuffer.texture?.bind()
    gl.uniform1f(gl.uniforms.opacity, opacity)
    gl.uniformMatrix4fv(gl.uniforms.matrix, false, matrix)

    drawTexture(this.getAttribBuffer(gl), width, height, true)

    // 释放
    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  destroy(gl?: ThisWebGLContext) {
    super.destroy()
    this._viewFramebuffer?.destory()
    this._viewFramebuffer = null

    this._subLayers?.forEach(el => el.destroy(gl))
    this._subLayers = undefined
  }
}
