import Store from '../render/Store'
import {drawSimpleTexture, Framebuffer, m4, ThisWebGLContext} from '../base'
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
import Camera from './Camera'
import {DefaultMatrix} from '../base/m4'

export default class Layer {
  constructor(drawer: AbstractDrawer<LayerProps>, camera?: Camera) {
    this.drawer = drawer
    this.camera = camera
  }

  private drawer: AbstractDrawer<LayerProps>
  private camera?: Camera

  private _framebuffer?: Framebuffer
  // 遮罩
  private _maskLayer?: Layer
  private _maskFramebuffer?: Framebuffer

  get id() {
    return this.drawer.id
  }

  get type() {
    return this.drawer.type
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

  isShowTime(frameId: number) {
    return frameId >= this.inFrame && frameId < this.outFrame
  }

  async init(gl: ThisWebGLContext, parentLayers?: LayerProps[]) {
    let drawer = this.drawer
    // 遮罩对象
    const trackMatteType = drawer.trackMatteType
    const trackId = drawer.props.trackMatteLayer
    if (trackMatteType != TrackMatteType.None && trackId && parentLayers) {
      const trackProps = parentLayers.find(el => el.id == trackId)
      if (trackProps) {
        this._maskLayer = createLayer(
          trackProps,
          drawer.store,
          drawer.parentWidth,
          drawer.parentHeight,
          trackProps.is3D ? this.camera : undefined,
        )
      }
    }
    // 初始化
    await drawer.init(gl)
    await this._maskLayer?.init(gl)

    // 如果在异步区间触发了Reset，导致drawer发生变更，则原来需要释放掉
    if (drawer !== this.drawer) {
      drawer.destroy()
      drawer = null as any
    }
  }

  async reset(gl: ThisWebGLContext) {
    if (this.type === LayerType.Text) {
      // 文本
      const textDrawer = this.drawer as TextDrawer
      if (textDrawer.cacheText !== textDrawer.text) {
        // 如果文本不一样，就需要重新初始化一下
        await textDrawer.init(gl)
      }
      return
    }
    if (this.type === LayerType.Image || this.type === LayerType.Video) {
      // 图片、视频
      let drawer = this.drawer as ImageDrawer | VideoDrawer
      if (drawer.cacheUrl !== drawer.url) {
        const store = drawer.store
        const props = drawer.props
        const keyInfo = drawer.store.getKeyInfo(props.name)
        const parentWidth = drawer.parentWidth
        const parentHeight = drawer.parentHeight
        drawer.destroy()

        const type = keyInfo?.type || props.type
        props.type = type

        drawer =
          type === LayerType.Image
            ? new ImageDrawer(props, store, parentWidth, parentHeight)
            : new VideoDrawer(props, store, parentWidth, parentHeight)

        await drawer.init(gl)
        this.drawer = drawer
      }
      return
    }
    if (this.type === LayerType.Vector) {
      const vectorDrawer = this.drawer as VectorDrawer
      const subLayers = vectorDrawer.subLayers
      if (subLayers) {
        for (const subLayer of subLayers) {
          await subLayer.reset(gl)
        }
      }
    }
  }

  render(gl: ThisWebGLContext, parentMatrix: m4.Mat4, frameInfo: FrameInfo) {
    const drawer = this.drawer
    const localMatrix = drawer.getMatrix(frameInfo.frameId)
    if (!localMatrix) return
    const opacity = drawer.getOpacity(frameInfo)

    if (this.drawMaskBlend(gl, {localMatrix, opacity}, frameInfo, parentMatrix)) return

    gl.uniform1f(gl.uniforms.opacity, opacity)
    let matrix = this.camera?.getMatrix(frameInfo.frameId) || parentMatrix
    matrix = m4.multiply(matrix, localMatrix)
    drawer.draw(gl, matrix, frameInfo)
  }

  destroy() {
    this._framebuffer?.destory()
    this._framebuffer = undefined
    this._maskFramebuffer?.destory()
    this._maskFramebuffer = undefined
    this.camera = undefined

    this.drawer.destroy()
    this._maskLayer?.destroy()
    this._maskLayer = undefined
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

    const {localMatrix} = state
    const {width: parentWidth, height: parentHeight, framebuffer: parentFramebuffer} = frameInfo

    const attribBuffer = this.drawer.getAttribBuffer(gl)

    // 预先绘制图层
    const framebuffer = this._framebuffer || (this._framebuffer = new Framebuffer(gl))

    framebuffer.bind()
    framebuffer.viewport(parentWidth, parentHeight)

    let matrix = this.camera?.getMatrix(frameInfo.frameId) || parentMatrix
    matrix = m4.multiply(matrix, localMatrix)
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
      maskLayer.render(gl, parentMatrix, {
        ...frameInfo,
        framebuffer: maskFramebuffer,
      })

      // 遮罩着色器
      const srcTexture = framebuffer.reset()
      framebuffer.bind()
      framebuffer.viewport(parentWidth, parentHeight)

      gl.activeTexture(gl.TEXTURE0)
      srcTexture?.bind()
      gl.activeTexture(gl.TEXTURE1)
      maskFramebuffer.texture?.bind()

      gl.uniformMatrix4fv(gl.uniforms.matrix, false, DefaultMatrix)
      gl.uniform1i(gl.uniforms.maskMode, this.drawer.trackMatteType)

      drawSimpleTexture(attribBuffer)

      srcTexture?.destroy()
      gl.bindTexture(gl.TEXTURE_2D, null)
      gl.uniform1i(gl.uniforms.maskMode, 0)
    }

    // 混合模式
    if (blendMode) {
      const dstTexture = parentFramebuffer.reset()
      parentFramebuffer.bind()
      parentFramebuffer.viewport(parentWidth, parentHeight)

      gl.activeTexture(gl.TEXTURE0)
      framebuffer.texture?.bind()
      gl.activeTexture(gl.TEXTURE1)
      dstTexture?.bind()

      gl.uniformMatrix4fv(gl.uniforms.matrix, false, DefaultMatrix)
      gl.uniform1i(gl.uniforms.blendMode, this.drawer.blendMode)

      drawSimpleTexture(attribBuffer)

      dstTexture?.destroy()
      gl.uniform1i(gl.uniforms.blendMode, 0)
      gl.bindTexture(gl.TEXTURE_2D, null)
    } else {
      // 普通模式
      parentFramebuffer.bind()
      gl.activeTexture(gl.TEXTURE0)
      framebuffer.texture?.bind()
      gl.uniform1f(gl.uniforms.opacity, 1.0)
      gl.uniformMatrix4fv(gl.uniforms.matrix, false, DefaultMatrix)

      drawSimpleTexture(attribBuffer)
    }

    return true
  }

  // Replay调用
  replay() {
    if (this.type === LayerType.Video) {
      // 视频
      const videoDrawer = this.drawer as VideoDrawer
      videoDrawer.replay()
    }
    if (this.type === LayerType.Vector) {
      const vectorDrawer = this.drawer as VectorDrawer
      const subLayers = vectorDrawer.subLayers
      if (subLayers) {
        for (const subLayer of subLayers) {
          subLayer.replay()
        }
      }
    }
  }
}

export function createLayer(
  props: LayerProps,
  store: Store,
  parentWidth: number,
  parentHeight: number,
  camera?: Camera,
) {
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

      return new Layer(new TextDrawer(textProps, store, parentWidth, parentHeight), camera)
    }
    case LayerType.Image:
    case LayerType.Video: {
      store.addKeyInfo(props as LayerVideoProps | LayerImageProps)
      const kv = store.getKeyInfo(props.name)
      const type = kv?.type || props.type

      return new Layer(
        type === LayerType.Video
          ? new VideoDrawer(props as LayerVideoProps, store, parentWidth, parentHeight)
          : new ImageDrawer(props as LayerImageProps, store, parentWidth, parentHeight),
        camera,
      )
    }
    case LayerType.Vector:
      return new Layer(new VectorDrawer(props as LayerVectorProps, store, parentWidth, parentHeight), camera)
    case LayerType.ShapeLayer:
      return new Layer(new ShapeDrawer(props as LayerShapeProps, store, parentWidth, parentHeight), camera)
  }

  return undefined
}
