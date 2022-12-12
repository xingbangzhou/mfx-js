import MscxFrameworkContext from '../privates/FrameworkContext'
import MscxModuleCleaner from '../privates/ModuleCleaner'
import ModuleEx from './ModuleEx'

class FrameChannel {
  constructor() {
    window.addEventListener('message', this.onMessage)
  }

  private modules?: FrameModule[]

  attach(module: FrameModule) {
    if (!this.modules) this.modules = [module]
    else if (!this.modules.includes(module)) {
      this.modules.push(module)
    }
  }

  detach(module: FrameModule) {
    this.modules = this.modules?.filter(el => el !== module)
  }

  private onMessage = (ev: MessageEvent<any>) => {
    const {source, data} = ev
    if (source === window) return
    const module = this.modules?.find(el => el.window === source)
    if (!module) return

    try {
      const cmd = data.cmd
      const args = data.args
      if (Array.isArray(args)) {
        module.onCommand(cmd, ...args)
      }
    } catch (error) {
      console.error('[FrameChannel]onMesssage, error', error)
    }
  }
}

const channel = new FrameChannel()

export default class FrameModule extends ModuleEx {
  constructor(fwCtx: MscxFrameworkContext, cleaner: MscxModuleCleaner, id: string, container: HTMLIFrameElement) {
    super(fwCtx, cleaner, id)

    this.container = container
    channel.attach(this)

    this.imReady()
  }

  private container?: HTMLIFrameElement

  get window() {
    return this.container?.contentWindow
  }

  resize(width: number, height: number) {
    this.container && Object.assign(this.container.style, {width: `${width}px`, height: `${height}px`})
  }

  protected postMessage(cmd: string, ...args: any[]) {
    this.window?.postMessage({cmd, args}, '*')
  }

  protected unload() {
    super.unload()
    channel.detach(this)
    this.container = undefined
  }
}
