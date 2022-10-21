import McoFrameworkContext from 'src/privates/FrameworkContext'
import McoModuleCleaner from 'src/privates/ModuleCleaner'
import RPCModule from './RPCModule'

class RPCChannel {
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

    let cmd: string | undefined = undefined
    let args: any[] = []
    try {
      cmd = data.cmd
      if (Array.isArray(data.args)) {
        args = data.args
      }
    } catch (error) {
      console.error('[RPCChannel]onMesssage, error', error)
    }

    cmd && module.onHandle(cmd, ...args)
  }
}

const channel = new RPCChannel()

export default class FrameModule extends RPCModule {
  constructor(fwCtx: McoFrameworkContext, cleaner: McoModuleCleaner, id: string, container: HTMLIFrameElement) {
    super(fwCtx, cleaner, id)

    this.container = container
    channel.attach(this)

    this.fwReady()
  }

  private container?: HTMLIFrameElement

  get window() {
    return this.container?.contentWindow
  }

  protected rpc(cmd: string, ...args: any[]) {
    this.window?.postMessage({cmd, args}, '*')
  }

  protected unload() {
    channel.detach(this)
    this.container = undefined
  }
}
