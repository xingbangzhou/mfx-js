import McoFrameworkContext from '../privates/FrameworkContext'
import McoModule from '../Module'
import McoModuleCleaner from '../privates/ModuleCleaner'
import logger from '../privates/logger'

enum MdiCommand {
  Ready = 'mco-mdi:ready',
  Link = 'mco-mdi:link',
  Unlink = 'mco-mdi:unlink',
  ConnectSignal = 'mco-mdi:connect_signal',
  DisconnectSignal = 'mco-mdi:disconnect_signal',
  Invoke = 'mco-mdi:invoke',
  Method = 'mco-mdi:method',
  PostEvent = 'mco-mdi:post_event',
  AddEventListener = 'mco-mdi:add_event_listener',
  RemoveEventListener = 'mco-mdi:remove_event_listener',
}

enum FrameworkCommand {
  Ready = 'mco-framework:ready',
  LinkStatus = 'mco-framework:link_status',
  CallResult = 'mco-framework:call_result',
  Signal = 'mco-framework:signal',
  Event = 'mco-framework:event',
}

export default abstract class ExtModule extends McoModule {
  constructor(fwCtx: McoFrameworkContext, cleaner: McoModuleCleaner, id: string) {
    super(fwCtx, cleaner, id)
  }

  onCommand(cmd: string, ...args: any[]) {
    logger.log('ExtModule', 'onCommand: ', cmd, ...args)

    switch (cmd) {
      case MdiCommand.Ready:
        this.imReady()
        break
      case MdiCommand.Link:
        {
          const [clazz] = args
          this.ctx.link(clazz, this.onLinkStatus)
        }
        break
      case MdiCommand.Unlink:
        {
          const [clazz] = args
          this.ctx.unlink(clazz, this.onLinkStatus)
        }
        break
      case MdiCommand.Invoke:
        {
          const [id, clazz, name, ...params] = args
          this.onInvoke(id, clazz, name, ...params)
        }
        break
      case MdiCommand.Method:
        {
          const [id, name, ...params] = args
          this.onMethod(id, name, ...params)
        }
        break
      case MdiCommand.ConnectSignal:
        {
          const [clazz, signal] = args
          this.ctx.connectSignal(clazz, signal, this.onSignal)
        }
        break
      case MdiCommand.DisconnectSignal:
        {
          const [clazz, signal] = args
          this.ctx.disconnectSignal(clazz, signal, this.onSignal)
        }
        break
      case MdiCommand.PostEvent:
        {
          const [event, ...params] = args
          this.ctx.postEvent(event, ...params)
        }
        break
      case MdiCommand.AddEventListener:
        {
          const [event] = args
          this.ctx.addEventListener(event, this.onEvent)
        }
        break
      case MdiCommand.RemoveEventListener:
        {
          const [event] = args
          this.ctx.removeEventListener(event, this.onEvent)
        }
        break
    }
  }

  protected imReady() {
    this.postMessage(FrameworkCommand.Ready)
  }

  protected abstract postMessage(cmd: string, ...args: any[]): void

  private async onInvoke(id: string, clazz: string, name: string, ...args: any[]) {
    const result = await this.ctx.invoke(clazz, name, ...args)
    this.postMessage(FrameworkCommand.CallResult, id, result)
  }

  private async onMethod(id: string, name: string, ...args: any[]) {
    const result = await (this as any)[name]?.(...args)
    this.postMessage(FrameworkCommand.CallResult, id, result)
  }

  private onLinkStatus = (on: boolean, clazz: string) => {
    this.postMessage(FrameworkCommand.LinkStatus, on, clazz)
  }

  private onSignal = (clazz: string, signal: string, ...args: any[]) => {
    this.postMessage(FrameworkCommand.Signal, clazz, signal, ...args)
  }

  private onEvent = (event: string, ...args: any[]) => {
    logger.log('ExtModule', 'onEvent: ', event, ...args)

    this.postMessage(FrameworkCommand.Event, event, ...args)
  }
}
