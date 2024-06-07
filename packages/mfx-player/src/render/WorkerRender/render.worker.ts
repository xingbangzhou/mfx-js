import {Mat4} from 'src/base/m4'
import {drawSimpleTexture, Framebuffer, m4} from '../../base'
import AttribBuffer from '../../base/webgl/AttribBuffer'
import {ThisWebGLContext} from '../../base/webgl/types'
import Layer, {createLayer} from '../../layers/Layer'
import {setSimpleProgram} from '../../layers/setPrograms'
import RenderStore from '../RenderStore'
import {KeyValue, LayerProps, PlayOptions, PlayProps, PlayState} from '../../types'
import {InvokeParameterMap, CallbackParameterMap} from './types'

const mapRenderProxys: Record<number, WorkerRenderProxy> = {}

const mapInvokeHandles: Record<keyof InvokeParameterMap, (params: any) => void> = {
  instance: ({id, canvas, opts}: {id: number; canvas: OffscreenCanvas; opts?: PlayOptions}) => {
    mapRenderProxys[id] = new WorkerRenderProxy(id, canvas, opts)
  },

  load: ({
    id,
    resolveId,
    props,
    keys,
  }: {
    id: number
    resolveId: number
    props: PlayProps
    keys?: KeyValue | KeyValue[]
  }) => {
    const renderProxy = mapRenderProxys[id]
    renderProxy?.load(resolveId, props, keys)
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
    delete mapRenderProxys[id]
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
  constructor(id: number, canvas: OffscreenCanvas, opts?: PlayOptions) {
    this.id = id
    this._canvas = canvas
    this._gl = canvas.getContext('webgl2') as ThisWebGLContext
    if (!this._gl) {
      console.error(`WebGLRender, getContext('webgl') is null`)
    }
    this._store = new RenderStore()

    if (opts?.loop) this.loop = true
  }

  readonly id: number
  private _store: RenderStore

  private _canvas: OffscreenCanvas
  private _gl?: ThisWebGLContext

  private _playState = PlayState.None
  private _frameAnimId: any

  private _camera?: Mat4
  private _framebuffer?: Framebuffer
  private _attribBuffer?: AttribBuffer
  private _rootLayers?: Layer[]

  // 播放选项
  protected loop?: boolean

  async load(resolveId: number, props: PlayProps, keys?: KeyValue | KeyValue[]) {
    const store = this._store
    store.setProps(props)

    keys && store.setKeyValue(keys)

    const rootLayers = store.rootLayers
    await this.initLayers(this._gl as ThisWebGLContext, store, rootLayers || [])

    const keyInfos = store.getAllKeyInfo()

    callbackMain(this.id, 'loaded', {keyInfos, resolveId})

    if (this._playState === PlayState.Play) {
      this.play0()
    }

    return keyInfos
  }

  play() {
    if (this._playState === PlayState.Destory) {
      console.error('This Player has Destroyed!')
      return
    }
    if (this._playState !== PlayState.Play) {
      this.play0()
    }
  }

  replay() {
    this.pause()

    this._store.frameId = -1
    this.play()
  }

  pause() {
    clearInterval(this._frameAnimId)
    this._frameAnimId = undefined

    this._playState = PlayState.Pause
    callbackMain(this.id, 'play', undefined)
  }

  destroy() {
    // 清理定时器
    clearInterval(this._frameAnimId)
    this._frameAnimId = undefined
    // 清理图层
    this.clearLayers()

    this._framebuffer?.destory()
    this._framebuffer = undefined
    this._attribBuffer?.destroy()
    this._attribBuffer = undefined
    this._camera = undefined

    delete mapRenderProxys[this.id]

    this._playState = PlayState.Destory
    callbackMain(this.id, 'destroy', undefined)
  }

  resizeCanvasToDisplaySize(width: number, height: number) {
    this._canvas.width = width
    this._canvas.height = height
  }

  private play0() {
    this._playState = PlayState.Play

    if (!this._rootLayers?.length) return

    callbackMain(this.id, 'play', undefined)

    this.render()
  }

  protected render = () => {
    if (this._frameAnimId) {
      clearInterval(this._frameAnimId)
      this._frameAnimId = undefined
    }

    this._frameAnimId = setInterval(this.render0, this._store.frameTime)

    this.render0()
  }

  private render0 = () => {
    const {frames, width, height} = this._store
    let frameId = this._store.frameId

    frameId = frameId + 1
    if (frameId >= frames) {
      if (this.loop) {
        frameId = 0
      } else {
        clearInterval(this._frameAnimId)
        this._frameAnimId = undefined

        this._playState = PlayState.End
        callbackMain(this.id, 'end', undefined)
      }
    }
    this._store.frameId = frameId

    const gl = this._gl
    if (!gl) return

    // 混合模式、Alpha预乘
    gl.enable(gl.BLEND)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    // 默认绘制Framebuffer
    const framebuffer = (this._framebuffer = this._framebuffer || new Framebuffer(gl))
    const frameInfo = {
      frames,
      frameId,
      width,
      height,
      opacity: 1.0,
      framebuffer: framebuffer,
    }

    framebuffer.bind()
    framebuffer.viewport(width, height)

    this._camera = this._camera || m4.perspectiveCamera(width, height)
    const rootLayers = this._rootLayers
    if (rootLayers) {
      for (let i = 0, l = rootLayers?.length || 0; i < l; i++) {
        const layer = rootLayers?.[i]
        if (!layer.verifyTime(frameInfo.frameId)) continue
        layer.render(gl, this._camera, frameInfo)
      }
    }

    // 绘制默认上屏
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.disable(gl.BLEND)

    setSimpleProgram(gl)

    gl.activeTexture(gl.TEXTURE0)
    framebuffer.texture?.bind()

    const attribBuffer = this._attribBuffer || new AttribBuffer(gl)
    this._attribBuffer = attribBuffer

    drawSimpleTexture(attribBuffer)

    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  private async initLayers(gl: ThisWebGLContext, store: RenderStore, rootLayerProps: LayerProps[]) {
    this.clearLayers()
    this._rootLayers = []

    for (let i = rootLayerProps.length - 1; i >= 0; i--) {
      const props = rootLayerProps[i]
      // 遮罩过滤
      if (props.isTrackMatte) continue
      // 创建图层
      const layer = createLayer(props, store)
      if (!layer) continue
      this._rootLayers.push(layer)
      await layer.init(gl, rootLayerProps)
    }
  }

  private clearLayers() {
    const {_gl} = this

    this._rootLayers?.forEach(layer => layer.destroy(_gl))
    this._rootLayers = undefined
  }
}
