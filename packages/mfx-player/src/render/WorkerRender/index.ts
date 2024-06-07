import {KeyItemInfo, KeyValue, PlayOptions, PlayProps, PlayState} from '../../types'
import {InvokeParameterMap, CallbackParameterMap} from './types'

let lastRenderId = 0
const mapRenderObjs: Record<number, WorkerRender> = {}

function createRenderId() {
  lastRenderId++
  if (lastRenderId >= 2100000000) {
    lastRenderId = 1
  }
  return lastRenderId
}

let _worker: Worker | undefined = undefined

function worker() {
  if (_worker) return _worker

  _worker = new Worker(new URL('./render.worker.ts', import.meta.url))
  _worker.onmessage = onWorkerCallback

  return _worker
}

function onWorkerCallback<M extends keyof CallbackParameterMap>(
  event: MessageEvent<{id: number; message: M; params: CallbackParameterMap[M]}>,
) {
  const eventData = event.data
  const renderObj = mapRenderObjs[eventData.id]
  if (!renderObj) return

  renderObj.onCallback(eventData.message, eventData.params)
}

function invokeWorker<F extends keyof InvokeParameterMap>(
  fn: F,
  params: InvokeParameterMap[F],
  transfer?: Transferable[],
) {
  worker().postMessage({fn: fn, params}, transfer || [])
}

export default class WorkerRender {
  constructor(container: HTMLElement, opts?: PlayOptions) {
    this.id = createRenderId()
    mapRenderObjs[this.id] = this

    this._canvas = document.createElement('canvas')
    container.appendChild(this._canvas)
    const offscreenCanvas = this._canvas.transferControlToOffscreen()

    invokeWorker('instance', {id: this.id, canvas: offscreenCanvas, opts}, [offscreenCanvas])
  }

  readonly id: number
  private _canvas?: HTMLCanvasElement

  private _playState = PlayState.None

  private _resolveId = 0
  private _resolveFns?: Record<number, any>

  async load(props: PlayProps, keys?: KeyValue | KeyValue[]) {
    if (this._playState === PlayState.Destory) return undefined

    const resolveId = this.createResolveId()

    invokeWorker('load', {id: this.id, resolveId, props, keys})

    return new Promise<KeyItemInfo[] | undefined>(resolve => {
      this._resolveFns = this._resolveFns || {}
      this._resolveFns[resolveId] = resolve
    })
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

  resizeCanvasToDisplaySize(multiplier?: number) {
    const canvas = this._canvas
    if (!canvas) return

    multiplier = multiplier || 1
    const width = (canvas.clientWidth * multiplier) | 0
    const height = (canvas.clientHeight * multiplier) | 0

    invokeWorker('resizeCanvasToDisplaySize', {id: this.id, width, height})
  }

  destroy() {
    this.clear()

    invokeWorker('destroy', {id: this.id})
  }

  // Worker回调消息处理
  onCallback<M extends keyof CallbackParameterMap>(message: M, params: CallbackParameterMap[M]) {
    switch (message) {
      case 'loaded':
        {
          if (!this._resolveFns) return
          const {resolveId, keyInfos} = params as CallbackParameterMap['loaded']
          this._resolveFns[resolveId](keyInfos)
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
        this._playState = PlayState.Destory
        this.clear(true)
        return
    }
  }

  protected createResolveId() {
    this._resolveId++
    if (this._resolveId >= 2100000000) {
      this._resolveId = 1
    }
    return this._resolveId
  }

  private clear(del?: boolean) {
    this._canvas?.parentNode?.removeChild(this._canvas)
    this._canvas = undefined

    this._resolveFns = undefined

    if (del) {
      delete mapRenderObjs[this.id]
    }
  }
}
