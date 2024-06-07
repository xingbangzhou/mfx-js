import RenderStore from '../render/RenderStore'
import {drawSimpleTexture, drawTexture, Framebuffer, m4, ThisWebGLContext} from '../base'
import {
  FrameInfo,
  LayerImageProps,
  LayerProps,
  LayerShapeProps,
  LayerTextProps,
  LayerType,
  LayerVectorProps,
  LayerVideoProps,
  TrackMatteType,
} from '../types'
import AbstractDrawer from './AbstractDrawer'
import ImageDrawer from './ImageDrawer'
import ShapeDrawer from './ShapeDrawer'
import TextDrawer from './TextDrawer'
import VectorDrawer from './VectorDrawer'
import VideoDrawer from './VideoDrawer'
import {setBlendProgram, setMaskProgram, setProgram} from './setPrograms'

export default class Layer {
  constructor(drawer: AbstractDrawer<LayerProps>) {
    this.drawer = drawer
  }

  private drawer: AbstractDrawer<LayerProps>
  private _framebuffer: Framebuffer | null = null

  // 遮罩
  private _maskLayer?: Layer
  private _maskFramebuffer?: Framebuffer | null = null

  get type() {
    return this.drawer.props.type
  }

  get width() {
    return this.drawer.width
  }

  get height() {
    return this.drawer.height
  }

  get inFrame() {
    return this.drawer.inFrame
  }

  get outFrame() {
    return this.drawer.outFrame
  }

  verifyTime(frameId: number) {
    return frameId >= this.inFrame && frameId <= this.outFrame
  }

  async init(gl: ThisWebGLContext, parentLayers?: LayerProps[]) {
    // 遮罩对象
    const trackMatteType = this.drawer.trackMatteType
    const trackId = this.drawer.props.trackMatteLayer
    if (trackMatteType != TrackMatteType.None && trackId && parentLayers) {
      const trackProps = parentLayers.find(el => el.id == trackId)
      if (trackProps) {
        this._maskLayer = createLayer(trackProps, this.drawer.store)
      }
    }
    // 初始化
    await this.drawer.init(gl)
    await this._maskLayer?.init(gl)
  }

  render(gl: ThisWebGLContext, parentMatrix: m4.Mat4, frameInfo: FrameInfo) {
    const drawer = this.drawer
    const localMatrix = drawer.getMatrix(frameInfo)
    if (!localMatrix) return
    const opacity = drawer.getOpacity(frameInfo)

    if (this.drawMaskBlend(gl, {localMatrix, opacity}, frameInfo, parentMatrix)) return

    setProgram(gl)
    gl.uniform1f(gl.uniforms.opacity, opacity)
    const matrix = m4.multiply(parentMatrix, localMatrix)
    drawer.draw(gl, matrix, frameInfo)
  }

  destroy(gl?: ThisWebGLContext) {
    this._framebuffer?.destory()
    this._maskFramebuffer?.destory()

    this._maskLayer?.destroy(gl)
    this.drawer.destroy(gl)
  }

  private drawMaskBlend(
    gl: ThisWebGLContext,
    state: {localMatrix: m4.Mat4; opacity: number},
    frameInfo: FrameInfo,
    parentMatrix: m4.Mat4,
  ) {
    const blendMode = this.drawer.blendMode
    const maskLayer = this._maskLayer
    if (!blendMode && !maskLayer) return false

    const {localMatrix, opacity} = state
    const {width: parentWidth, height: parentHeight, framebuffer: parentFramebuffer} = frameInfo

    const attribBuffer = this.drawer.getAttribBuffer(gl)

    // 默认着色器
    setProgram(gl)

    // 预先绘制图层
    const framebuffer = this._framebuffer || new Framebuffer(gl)
    this._framebuffer = framebuffer

    framebuffer.bind()
    framebuffer.viewport(parentWidth, parentHeight)
    const parentCamera = m4.perspectiveCamera(parentWidth, parentHeight)
    const matrix = m4.multiply(parentCamera, localMatrix)
    this.drawer.draw(gl, matrix, {
      ...frameInfo,
      framebuffer: framebuffer,
    })

    // 绘制遮罩层
    if (maskLayer) {
      const maskFramebuffer = this._maskFramebuffer || new Framebuffer(gl)
      this._maskFramebuffer = maskFramebuffer

      maskFramebuffer.bind()
      maskFramebuffer.viewport(parentWidth, parentHeight)
      maskLayer.render(gl, parentCamera, {
        ...frameInfo,
        framebuffer: maskFramebuffer,
      })

      // 遮罩着色器
      setMaskProgram(gl, this.drawer.trackMatteType)
      const srcTexture = framebuffer.reset()
      framebuffer.bind()
      framebuffer.viewport(parentWidth, parentHeight)

      gl.activeTexture(gl.TEXTURE0)
      srcTexture?.bind()
      gl.activeTexture(gl.TEXTURE1)
      maskFramebuffer.texture?.bind()

      drawSimpleTexture(attribBuffer)

      srcTexture?.destroy()
      gl.bindTexture(gl.TEXTURE_2D, null)
    }

    // 混合模式
    if (blendMode) {
      setBlendProgram(gl, blendMode)
      const dstTexture = parentFramebuffer.reset()
      parentFramebuffer.bind()
      parentFramebuffer.viewport(parentWidth, parentHeight)

      gl.activeTexture(gl.TEXTURE0)
      framebuffer.texture?.bind()
      gl.activeTexture(gl.TEXTURE1)
      dstTexture?.bind()

      drawSimpleTexture(attribBuffer)

      dstTexture?.destroy()
      gl.bindTexture(gl.TEXTURE_2D, null)
    } else {
      // 普通模式
      setProgram(gl)
      parentFramebuffer.bind()

      gl.activeTexture(gl.TEXTURE0)
      framebuffer.texture?.bind()
      gl.uniform1f(gl.uniforms.opacity, opacity)
      gl.uniformMatrix4fv(gl.uniforms.matrix, false, parentMatrix)

      drawTexture(attribBuffer, parentWidth, parentHeight, true)
      gl.bindTexture(gl.TEXTURE_2D, null)
    }

    return true
  }
}

export function createLayer(props: LayerProps, store: RenderStore) {
  const {id, type, ...other} = props
  if (type === LayerType.PreComposition) {
    const compProps = store.getCompLayer(id)
    if (!compProps) return undefined
    props = {...compProps, ...other}
  }

  switch (props.type) {
    case LayerType.Text: {
      const textProps = props as LayerTextProps
      store.addKeyInfo(textProps)

      return new Layer(new TextDrawer(textProps, store))
    }
    case LayerType.Image:
    case LayerType.Video: {
      store.addKeyInfo(props as LayerVideoProps | LayerImageProps)
      const kv = store.getKeyInfo(props.name)
      const type = kv?.type || props.type

      return new Layer(
        type === LayerType.Video
          ? new VideoDrawer(props as LayerVideoProps, store)
          : new ImageDrawer(props as LayerImageProps, store),
      )
    }
    case LayerType.Vector:
      return new Layer(new VectorDrawer(props as LayerVectorProps, store))
    case LayerType.ShapeLayer:
      return new Layer(new ShapeDrawer(props as LayerShapeProps, store))
  }

  return undefined
}
