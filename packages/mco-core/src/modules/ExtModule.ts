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
  Method = 'activator.method',
  PostEvent = 'activator.post_event',
  AddEventListener = 'activator.add_event_listener',
  RemoveEventListener = 'activator.remove_event_listener',
}

enum RespCommand {
  Ready = 'module.ready',
  LinkStatus = 'module.link_status',
  CallResult = 'module.call_result',
  Signal = 'module.signal',
  Event = 'module.event',
}

export default abstract class ExtModule extends McoModule {
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
        {
          const [clazz] = args
          this.ctx.link(clazz, this.onLinkStatus)
        }
        break
      case AskCommand.Unlink:
        {
          const [clazz] = args
          this.ctx.unlink(clazz, this.onLinkStatus)
        }
        break
      case AskCommand.Invoke:
        {
          const [id, clazz, name, ...params] = args
          this.handleInvoke(id, clazz, name, ...params)
        }
        break
      case AskCommand.Method:
        {
          const [id, name, ...params] = args
          this.handleMethod(id, name, ...params)
        }
        break
      case AskCommand.ConnectSignal:
        {
          const [clazz, signal] = args
          this.ctx.connectSignal(clazz, signal, this.onSignal)
        }
        break
      case AskCommand.DisconnectSignal:
        {
          const [clazz, signal] = args
          this.ctx.disconnectSignal(clazz, signal, this.onSignal)
        }
        break
      case AskCommand.PostEvent:
        {
          const [event, ...params] = args
          this.ctx.postEvent(event, ...params)
        }
        break
      case AskCommand.AddEventListener:
        {
          const [event] = args
          this.ctx.addEventListener(event, this.onEvent)
        }
        break
      case AskCommand.RemoveEventListener:
        {
          const [event] = args
          this.ctx.removeEventListener(event, this.onEvent)
        }
        break
      default:
        break
    }
  }

  protected ready() {
    this.postMessage(RespCommand.Ready)
  }

  protected abstract postMessage(cmd: string, ...args: any[]): void

  private async handleInvoke(id: string, clazz: string, name: string, ...args: any[]) {
    const result = await this.ctx.invoke(clazz, name, ...args)
    this.postMessage(RespCommand.CallResult, id, result)
  }

  private async handleMethod(id: string, name: string, ...args: any[]) {
    const result = await (this as any)[name]?.(...args)
    this.postMessage(RespCommand.CallResult, id, result)
  }

  private onLinkStatus = (on: boolean, clazz: string) => {
    this.postMessage(RespCommand.LinkStatus, on, clazz)
  }

  private onSignal = (clazz: string, signal: string, ...args: any[]) => {
    this.postMessage(RespCommand.Signal, clazz, signal, ...args)
  }

  private onEvent = (event: string, ...args: any[]) => {
    logger.log('ModuleProxy.onEvent', event, ...args)

    this.postMessage(RespCommand.Event, event, ...args)
  }
}
