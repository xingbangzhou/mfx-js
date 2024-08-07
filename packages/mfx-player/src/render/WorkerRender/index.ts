import {MfxKeyInfo, MfxKeyValue, PlayerOptions, PlayState, MfxPlayProps, MfxPlayInfo} from '../../types'
import {InvokeParameterMap, CallbackParameterMap} from './types'

/**
 * @brief Render对象映射id
 */
let lastRenderId = 0
function createRenderId() {
  lastRenderId++
  if (lastRenderId >= 2100000000) {
    lastRenderId = 1
  }
  return lastRenderId
}

/**
 * @brief 异步回调映射id
 */
let lastResolveId = 0
function createResolveId() {
  lastResolveId++
  if (lastResolveId >= 2100000000) {
    lastResolveId = 1
  }
  return lastResolveId
}

let _worker: Worker | undefined = undefined
const mapRenderObjs: Record<number, WorkerRender> = {}

function worker() {
  if (_worker) return _worker

  _worker = new Worker(new URL('./render.worker', import.meta.url))
  _worker.onmessage = onWorkerCallback

  return _worker
}

function onWorkerCallback<M extends keyof CallbackParameterMap>(
  event: MessageEvent<{id: number; message: M; params: CallbackParameterMap[M]}>,
) {
  const eventData = event.data
  const renderObj = mapRenderObjs[eventData.id]
  if (!renderObj) return

  renderObj.onWorkerCallback(eventData.message, eventData.params)
}

function invokeWorker<F extends keyof InvokeParameterMap>(
  fn: F,
  params: InvokeParameterMap[F],
  transfer?: Transferable[],
) {
  worker().postMessage({fn: fn, params}, transfer || [])
}

export default class WorkerRender {
  constructor(container: HTMLElement, opts?: PlayerOptions) {
    this.id = createRenderId()
    mapRenderObjs[this.id] = this

    this._canvas = document.createElement('canvas')
    container.appendChild(this._canvas)
    const offscreenCanvas = this._canvas.transferControlToOffscreen()

    invokeWorker('instance', {id: this.id, canvas: offscreenCanvas, opts}, [offscreenCanvas as any])
  }

  readonly id: number
  private _canvas?: HTMLCanvasElement

  private _playState = PlayState.None
  private _resolveFns?: Record<number, any>

  async load(props: MfxPlayProps, keys?: MfxKeyValue | MfxKeyValue[]) {
    if (this._playState === PlayState.Destory) return undefined

    const resolveId = createResolveId()

    invokeWorker('load', {id: this.id, resolveId, props, keys})

    this.resizeCanvasToDisplaySize()

    return new Promise<{keys: MfxKeyInfo[]; info?: MfxPlayInfo} | undefined>(resolve => {
      this._resolveFns = this._resolveFns || {}
      this._resolveFns[resolveId] = resolve
    })
  }

  setKeys(keys: MfxKeyValue | MfxKeyValue[]) {
    if (this._playState === PlayState.Destory) return

    invokeWorker('setKeys', {id: this.id, keys})
  }

  play() {
    if (this._playState === PlayState.Destory) return

    invokeWorker('play', {id: this.id})
  }

  replay() {
    if (this._playState === PlayState.Destory) return

    invokeWorker('replay', {id: this.id})
  }

  pause() {
    if (this._playState === PlayState.Destory) return

    invokeWorker('pause', {id: this.id})
  }

  resizeCanvasToDisplaySize() {
    const canvas = this._canvas
    if (!canvas) return

    const width = canvas.clientWidth | 0
    const height = canvas.clientHeight | 0

    invokeWorker('resizeCanvasToDisplaySize', {id: this.id, width, height})
  }

  destroy() {
    this.clear()

    invokeWorker('destroy', {id: this.id})
  }

  // Worker回调消息处理
  onWorkerCallback<M extends keyof CallbackParameterMap>(message: M, params: CallbackParameterMap[M]) {
    switch (message) {
      case 'loaded':
        {
          if (!this._resolveFns) return
          const {resolveId, keys, info} = params as CallbackParameterMap['loaded']
          this._resolveFns[resolveId]({keys, info})
          delete this._resolveFns[resolveId]
        }
        return
      case 'play':
        this._playState = PlayState.Play
        return
      case 'frame':
        return
      case 'pause':
        this._playState = PlayState.Pause
        return
      case 'end':
        this._playState = PlayState.End
        return
      case 'destroy':
        {
          this.clear(true)
        }
        return
    }
  }

  private clear(del?: boolean) {
    this._playState = PlayState.Destory
    this._canvas?.parentNode?.removeChild(this._canvas)
    this._canvas = undefined

    if (del) {
      delete mapRenderObjs[this.id]
    }

    // 清理Resolve
    const resolveFns = this._resolveFns
    this._resolveFns = undefined
    if (resolveFns) {
      for (const id in resolveFns) {
        const fn = resolveFns[id]
        fn?.(undefined)
      }
    }
  }
}
