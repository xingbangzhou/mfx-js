import Store from '../render/Store'
import {Framebuffer, ThisWebGLContext, drawTexture} from '../base'
import {m4} from '../base'
import {FrameInfo, LayerCameraProps, LayerType, LayerVectorProps} from '../types'
import AbstractDrawer from './AbstractDrawer'
import Camera from './Camera'
import Layer, {createLayer} from './Layer'

export default class VectorDrawer extends AbstractDrawer<LayerVectorProps> {
  constructor(props: LayerVectorProps, store: Store, parentWidth: number, parentHeight: number) {
    super(props, store, parentWidth, parentHeight)

    this._cameraMatrix = m4.centerCamera(this.width, this.height)
  }

  private _subLayers?: Layer[]
  private _viewFramebuffer: Framebuffer | null = null
  private _cameraMatrix: m4.Mat4

  get subLayers() {
    return this._subLayers
  }

  async init(gl: ThisWebGLContext) {
    const subLayerProps = this.props.layers
    if (!subLayerProps) return

    this._viewFramebuffer = new Framebuffer(gl)
    this._subLayers = []

    const width = this.width
    const height = this.height
    const frames = this.outFrame - this.inFrame

    // 格外相机
    let camera: Camera | undefined = undefined
    let end = 0
    let props = subLayerProps[0]
    if (props?.type === LayerType.Camera) {
      const outFrame = Math.min(frames, props.outFrame ?? frames)
      camera = new Camera({...props, outFrame} as LayerCameraProps, width, height)
      end = 1
    }
    const subLayers = this._subLayers
    for (let i = subLayerProps.length - 1; i >= end; i--) {
      props = subLayerProps[i]
      // 遮罩过滤
      if (props.isTrackMatte) continue
      // 创建图层
      const outFrame = Math.min(frames, props.outFrame ?? frames)
      const layer = createLayer({...props, outFrame}, this.store, width, height, props.is3D ? camera : undefined)
      if (!layer) continue
      subLayers.push(layer)
      await layer.init(gl, subLayerProps)
    }

    this.setMatrixCache()
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

    const frameId = frameInfo.frameId - this.inFrame

    const viewFrameInfo = {frameId, width: width, height: height, opacity, framebuffer}
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
