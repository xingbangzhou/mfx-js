import McoFrameworkContext from '../privates/FrameworkContext'
import McoModule from '../Module'
import McoModuleCleaner from '../privates/ModuleCleaner'
import logger from '../privates/logger'

enum AskCommand {
  Ready = 'activator.ready',
  Link = 'activator.link',
  Unlink = 'activator.unlink',
  ConnectSignal = 'activator.connect_signal',
  DisconnectSignal = 'activator.disconnect_signal',
  Invoke = 'activator.invoke',
  Inoke0 = 'activator.invoke0',
  PostEvent = 'activator.post_event',
  AddEventListener = 'activator.add_event_listener',
  RemoveEventListener = 'activator.remove_event_listener',
}

enum RespCommand {
  Ready = 'module.ready',
  LinkStatus = 'module.linke_status',
  InvokeResult = 'module.invoke_result',
  Signal = 'module.signal',
  Event = 'module.event',
}

export default abstract class ModuleProxy extends McoModule {
  constructor(fwCtx: McoFrameworkContext, cleaner: McoModuleCleaner, mId: string) {
    super(fwCtx, cleaner, mId)
  }

  onHandle(cmd: string, ...args: any[]) {
    logger.log('ModuleProxy.onHandle', cmd, ...args)

    switch (cmd) {
      case AskCommand.Ready:
        this.ready()
        break
      case AskCommand.Link:
        this.ctx.link(args[0], this.onLinkStatus)
        break
      case AskCommand.Unlink:
        this.ctx.unlink(args[0], this.onLinkStatus)
        break
      case AskCommand.Invoke:
        {
          const [id, uri, ...params] = args
          this.handleInvoke(1, id, uri, ...params)
        }
        break
      case AskCommand.Inoke0:
        {
          const [id, uri, ...params] = args
          this.handleInvoke(0, id, uri, ...params)
        }
        break
      case AskCommand.ConnectSignal:
        this.ctx.connectSignal(args[0], this.onSignal)
        break
      case AskCommand.DisconnectSignal:
        this.ctx.disconnectSignal(args[0], this.onSignal)
        break
      case AskCommand.PostEvent:
        {
          const [event, ...params] = args
          this.ctx.postEvent(event, ...params)
        }
        break
      case AskCommand.AddEventListener:
        this.ctx.addEventListener(args[0], this.onEvent)
        break
      case AskCommand.RemoveEventListener:
        this.ctx.removeEventListener(args[0], this.onEvent)
        break
      default:
        break
    }
  }

  protected ready() {
    this.postMessage(RespCommand.Ready)
  }

  protected abstract postMessage(cmd: string, ...args: any[]): void

  private async handleInvoke(mode: number, id: string, uri: string, ...args: any[]) {
    if (mode === 0) {
      const result = await (this as any)[uri]?.(...args)
      this.postMessage(RespCommand.InvokeResult, id, result)
    } else if (mode === 1) {
      const result = await this.ctx.invoke(uri, ...args)
      this.postMessage(RespCommand.InvokeResult, id, result)
    }
  }

  private onLinkStatus = (on: boolean, sId: string) => {
    this.postMessage(RespCommand.LinkStatus, on, sId)
  }

  private onSignal = (uri: string, ...args: any[]) => {
    this.postMessage(RespCommand.Signal, uri, ...args)
  }

  private onEvent = (event: string, ...args: any[]) => {
    logger.log('ModuleProxy.onEvent', event, ...args)

    this.postMessage(RespCommand.Event, event, ...args)
  }
}
