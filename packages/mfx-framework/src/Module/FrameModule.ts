import MxModuleContext from '../ModuleContext'
import {MxDestructor} from '../types'
import MxExModule from './ExModule'

class MxFrameChannel {
  constructor() {
    window.addEventListener('message', this.onMessage)
  }

  private _modules?: MxFrameModule[]

  attach(frameModule: MxFrameModule) {
    if (!this._modules) this._modules = [frameModule]
    else if (!this._modules.includes(frameModule)) {
      this._modules.push(frameModule)
    }
  }

  detach(frameModule: MxFrameModule) {
    this._modules = this._modules?.filter(el => el !== frameModule)
  }

  private onMessage = (ev: MessageEvent<any>) => {
    const {source, data} = ev
    if (source === window) return
    const frameModule = this._modules?.find(el => el.window === source)
    if (!frameModule) return

    try {
      const cmd = data.cmd
      const args = data.args
      if (Array.isArray(args)) {
        frameModule.onCommand(cmd, ...args)
      }
    } catch (error) {
      frameModule.ctx.logger.error('MxFrameChannel', 'onMesssage, error: ', error)
    }
  }
}

const channel = new MxFrameChannel()

export default class MxFrameModule extends MxExModule {
  constructor(ctx: MxModuleContext, destructor: MxDestructor, container: HTMLIFrameElement) {
    super(ctx, destructor)

    this._container = container
    channel.attach(this)

    this.imReady()
  }

  private _container?: HTMLIFrameElement

  get window() {
    return this._container?.contentWindow
  }

  resize(width: number, height: number) {
    this._container && Object.assign(this._container.style, {width: `${width}px`, height: `${height}px`})
  }

  protected postMessage(cmd: string, ...args: any[]) {
    this.window?.postMessage({cmd, args}, '*')
  }

  protected unload() {
    super.unload()
    channel.detach(this)
    this._container = undefined
  }
}
