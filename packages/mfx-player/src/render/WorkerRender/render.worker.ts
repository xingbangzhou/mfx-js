import {DefaultMatrix, Mat4} from '../../base/m4'
import {drawSimpleTexture, Framebuffer, getFillCoord, m4, Program} from '../../base'
import AttribBuffer from '../../base/webgl/AttribBuffer'
import {ThisWebGLContext} from '../../base/webgl/types'
import Layer, {createLayer} from '../../layers/Layer'
import Store from '../../Store'
import {
  MfxKeyValue,
  LayerProps,
  PlayerOptions,
  PlayState,
  LayerType,
  LayerCameraProps,
  MfxFillMode,
  MfxPlayInfo,
  MfxPlayProps,
} from '../../types'
import {InvokeParameterMap, CallbackParameterMap} from './types'
import Camera from '../../layers/Camera'
import vertexGlsl from '../../base/shader/vertex.glsl'
import fragmentGlsl from '../../base/shader/fragment.glsl'

const mapRenderProxys: Record<number, WorkerRenderProxy> = {}

const mapInvokeHandles: Record<keyof InvokeParameterMap, (params: any) => void> = {
  instance: ({id, canvas, opts}: {id: number; canvas: OffscreenCanvas; opts?: PlayerOptions}) => {
    new WorkerRenderProxy(id, canvas, opts)
  },

  load: ({
    id,
    resolveId,
    props,
    keys,
  }: {
    id: number
    resolveId: number
    props: MfxPlayProps
    keys?: MfxKeyValue | MfxKeyValue[]
  }) => {
    const renderProxy = mapRenderProxys[id]
    renderProxy?.load(resolveId, props, keys)
  },

  setKeys: ({id, keys}: {id: number; keys: MfxKeyValue | MfxKeyValue[]}) => {
    const renderProxy = mapRenderProxys[id]
    renderProxy?.setKeys(keys)
  },

  resizeCanvasToDisplaySize: ({id, width, height}: {id: number; width: number; height: number}) => {
    const renderProxy = mapRenderProxys[id]
    renderProxy?.resizeCanvasToDisplaySize(width, height)
  },

  play: ({id}: {id: number}) => {
    const renderProxy = mapRenderProxys[id]
    renderProxy?.play()
  },

  replay: ({id}: {id: number}) => {
    const renderProxy = mapRenderProxys[id]
    renderProxy?.replay()
  },

  pause: ({id}: {id: number}) => {
    const renderProxy = mapRenderProxys[id]
    renderProxy?.pause()
  },

  destroy: ({id}: {id: number}) => {
    const renderProxy = mapRenderProxys[id]
    renderProxy?.destroy()
  },
}

// 处理主线程的传递消息
function onInvokeMessage<F extends keyof InvokeParameterMap>(
  event: MessageEvent<{fn: F; params: InvokeParameterMap[F]}>,
) {
  const eventData = event.data
  mapInvokeHandles[eventData.fn]?.(eventData.params)
}

self.onmessage = onInvokeMessage

// 传递消息给主线程
const callbackMain = <M extends keyof CallbackParameterMap>(
  id: number,
  message: M,
  params: CallbackParameterMap[M],
) => {
  self.postMessage({id, message, params})
}

class WorkerRenderProxy {
  constructor(id: number, canvas: OffscreenCanvas, opts?: PlayerOptions) {
    this.id = id
    mapRenderProxys[id] = this

    this._store = new Store()

    if (opts) {
      if (opts.debug) this._store.debug = true
      if (opts.loop === true) this.loop = true
      if (opts.playAfterLoad === true) this.playAfterLoad = true
      this.fillMode = opts.fillMode
    }

    this.canvas = canvas
    canvas.addEventListener('webglcontextlost', this.onWebGlContextLost, false)
    canvas.addEventListener('webglcontextrestored', this.onWebGlContextLost, false)
    this.initGl(canvas)
  }

  readonly id: number
  readonly canvas: OffscreenCanvas
  private _store: Store

  private _playState = PlayState.None

  private _gl?: ThisWebGLContext
  private _framebuffer?: Framebuffer
  private _attribBuffer?: AttribBuffer
  private _program?: Program
  private _cameraMatrix?: Mat4
  private _rootLayers: Layer[] = []

  // 播放选项
  protected loop = false
  protected destroyAfterEnd = false
  protected playAfterLoad = false
  protected fillMode?: MfxFillMode
  // 适配尺寸
  private fillVertCoord = {lx: -1.0, ly: -1.0, rx: 1.0, ry: 1.0}
  private fillTexCoord = {lx: 0, ly: 0, rx: 1.0, ry: 1.0}

  async load(resolveId: number, props: MfxPlayProps, keys?: MfxKeyValue | MfxKeyValue[]) {
    if (this._playState === PlayState.Destory) {
      return undefined
    }

    const store = this._store
    store.clear()
    store.setProps(props)

    // 尺寸适配计算
    this.updateFillCoord()
    // 预先设置Keys
    keys && store.setKeys(keys)

    // 初始化Layers
    const rootLayers = store.rootLayers
    await this.initLayers(this._gl as ThisWebGLContext, store, rootLayers || [])
    // 判断是否自动播放
    if (this._playState === PlayState.Play || this.playAfterLoad) {
      this.play0()
    }
    // 返回数据给主线程
    const keyInfos = store.getAllKeyInfo()
    let output: MfxPlayInfo | undefined = undefined
    if (store.props) {
      output = {
        width: store.props.width,
        height: store.props.height,
        frames: Math.round(store.props.duration * store.props.frameRate),
        duration: store.props.duration,
        frameRate: store.props.frameRate,
      }
    }
    callbackMain(this.id, 'loaded', {
      keys: keyInfos || [],
      info: output,
      resolveId: resolveId,
    })
    return {keys: keyInfos, info: output}
  }

  async setKeys(keys: MfxKeyValue | MfxKeyValue[]) {
    this._store.setKeys(keys)

    const gl = this._gl
    if (gl) {
      // 重置图层
      const rootLayers = this._rootLayers
      for (const rootLayer of rootLayers) {
        await rootLayer.reset(gl)
      }
    }
    return true
  }

  play() {
    if (this._playState === PlayState.Destory) {
      return undefined
    }
    if (this._playState !== PlayState.Play) {
      this.play0()
    }
  }

  replay() {
    this.cancelFrameAnim()
    this._store.frameId = -1

    const rootLayers = this._rootLayers
    for (const rootLayer of rootLayers) {
      rootLayer.replay()
    }
    this.play0()
  }

  pause() {
    this.cancelFrameAnim()

    this._playState = PlayState.Pause
    callbackMain(this.id, 'play', undefined)
  }

  destroy() {
    this._playState = PlayState.Destory

    this.cancelFrameAnim()
    this.clearLayers()
    this.clearCanvas()
    this._store.clear()

    const id = this.id
    delete mapRenderProxys[id]

    callbackMain(id, 'destroy', undefined)
  }

  resizeCanvasToDisplaySize(width: number, height: number) {
    if (!this.canvas) return
    this.canvas.width = width
    this.canvas.height = height
    this.updateFillCoord()
  }

  private play0() {
    this._playState = PlayState.Play

    if (!this._rootLayers?.length) return

    callbackMain(this.id, 'play', undefined)

    this.startRender()
  }

  protected startRender() {
    this.cancelFrameAnim()

    if (this._gl) {
      this.startFrameAnim(this.render)

      this.render()
    }
  }

  private render = () => {
    const frames = this._store.frames
    let frameId = this._store.frameId
    if (!this._store.checkAllSync(frameId)) return

    frameId = frameId + 1
    if (frameId >= frames) {
      if (this.loop) {
        this.replay()
      } else {
        this.cancelFrameAnim()
        this._playState = PlayState.End
        callbackMain(this.id, 'end', undefined)
        if (this.destroyAfterEnd) {
          this.destroy()
        }
      }
      return
    }
    this._store.frameId = frameId

    const gl = this._gl
    if (gl) this.draw(gl)
  }

  private draw(gl: ThisWebGLContext) {
    const framebuffer = this._framebuffer || (this._framebuffer = new Framebuffer(gl))
    const frameId = this._store.frameId
    const width = this._store.width
    const height = this._store.height
    const frames = this._store.frames
    const frameInfo = {
      frames,
      frameId,
      width,
      height,
      opacity: 1.0,
      framebuffer: framebuffer,
    }

    // 混合模式、Alpha预乘
    gl.enable(gl.BLEND)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    framebuffer.bind()
    framebuffer.viewport(width, height)

    this._cameraMatrix = this._cameraMatrix as Mat4
    const rootLayers = this._rootLayers
    if (rootLayers) {
      for (let i = 0, l = rootLayers?.length || 0; i < l; i++) {
        const layer = rootLayers?.[i]
        if (!layer.isShowTime(frameInfo.frameId)) continue
        layer.render(gl, this._cameraMatrix, frameInfo)
      }
    }

    // 绘制上屏
    const canvasWidth = gl.canvas.width
    const canvasHeight = gl.canvas.height
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, canvasWidth, canvasHeight)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.disable(gl.BLEND)

    gl.activeTexture(gl.TEXTURE0)
    framebuffer.texture?.bind()
    gl.uniform1f(gl.uniforms.opacity, 1.0)
    gl.uniformMatrix4fv(gl.uniforms.matrix, false, DefaultMatrix)

    const attribBuffer = this._attribBuffer || (this._attribBuffer = new AttribBuffer(gl))

    drawSimpleTexture(attribBuffer, this.fillVertCoord, this.fillTexCoord)
  }

  private updateFillCoord() {
    if (!this.canvas) return
    const store = this._store
    const canvas = this.canvas
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    // 适配尺寸
    const {lx, ly, rx, ry, sw, sh} = getFillCoord(
      store.width,
      store.height,
      canvasWidth,
      canvasHeight,
      undefined,
      this.fillMode,
    )
    this.fillVertCoord = {
      lx: -sw,
      ly: -sh,
      rx: sw,
      ry: sh,
    }
    this.fillTexCoord = {
      lx,
      ly,
      rx,
      ry,
    }
  }

  private _frameAnimId: any = undefined
  private startFrameAnim(fn: (...args: any) => void) {
    if (this._frameAnimId) return
    this._frameAnimId = setInterval(fn, this._store.frameTime)
  }

  private cancelFrameAnim() {
    if (!this._frameAnimId) return
    clearInterval(this._frameAnimId)
    this._frameAnimId = undefined
  }

  private async initLayers(gl: ThisWebGLContext, store: Store, rootLayerProps: LayerProps[]) {
    this.clearLayers()

    const width = store.width
    const height = store.height
    const frames = store.frames

    this._cameraMatrix = m4.centerCamera(width, height)

    let layers = this._rootLayers
    let camera: Camera | undefined = undefined
    let end = 0
    const props = rootLayerProps[0]
    if (props?.type === LayerType.Camera) {
      const outFrame = Math.min(frames, props.outFrame ?? frames)
      camera = new Camera({...props, outFrame} as LayerCameraProps, width, height)
      end = 1
    }
    for (let i = rootLayerProps.length - 1; i >= end; i--) {
      const props = rootLayerProps[i]
      // 遮罩过滤
      if (props.isTrackMatte) continue
      // 创建图层
      const outFrame = Math.min(frames, props.outFrame ?? frames)
      const layer = createLayer({...props, outFrame}, store, width, height, props.is3D ? camera : undefined)
      if (!layer) continue
      layers.push(layer)
      await layer.init(gl, rootLayerProps)
    }
    // 安全对象判断
    if (layers !== this._rootLayers) {
      layers.forEach(el => el.destroy())
      layers = null as any
    }
  }

  private clearLayers() {
    const rootLayers = this._rootLayers
    rootLayers.forEach(layer => layer.destroy())
    this._rootLayers = []
    this._cameraMatrix = undefined
  }

  private initGl(canvas: OffscreenCanvas) {
    const gl = (this._gl = canvas.getContext('webgl2') as ThisWebGLContext)
    if (!gl || gl.isContextLost()) {
      console.error(`getContext('webgl2')`, 'null')
      this.destroy()
      return
    }

    gl.pixelStorei(this._gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)

    const program = (this._program = new Program(gl, {
      vertexShader: vertexGlsl,
      fragmentShader: fragmentGlsl,
    }))
    if (!program.valid) {
      // Program创建失败
      console.error(`program is invalid!`)
      this.destroy()
      return
    }
    program.use()
  }

  private clearCanvas() {
    this.canvas?.removeEventListener('webglcontextlost', this.onWebGlContextLost, false)
    this.canvas?.removeEventListener('webglcontextrestored', this.onWebGlContextRestored, false)

    this.clearGl()
  }

  private clearGl() {
    this._framebuffer?.destory()
    this._framebuffer = undefined
    this._attribBuffer?.destroy()
    this._attribBuffer = undefined
    this._program?.destroy()
    this._program = undefined

    this._gl = undefined
  }

  private onWebGlContextLost = (event: any) => {
    console.error('WebGlContextLost')

    // 异常退出
    this.destroy()
  }

  private onWebGlContextRestored = (event: any) => {
    console.error('WebGlContextRestored')
  }
}

const ctx: Worker = self as any

export default ctx
