import MscxFrameworkContext from '../privates/FrameworkContext'
import MscxModule from '../Module'
import MscxModuleCleaner from '../privates/ModuleCleaner'
import logger from '../privates/logger'

enum MdiCommand {
  Ready = 'mscx-mdi:ready',
  Link = 'mscx-mdi:link',
  Unlink = 'mscx-mdi:unlink',
  ConnectSignal = 'mscx-mdi:connect_signal',
  DisconnectSignal = 'mscx-mdi:disconnect_signal',
  Invoke = 'mscx-mdi:invoke',
  Method = 'mscx-mdi:method',
  PostEvent = 'mscx-mdi:post_event',
  AddEventListener = 'mscx-mdi:add_event_listener',
  RemoveEventListener = 'mscx-mdi:remove_event_listener',
}

enum FrameworkCommand {
  Ready = 'mscx-framework:ready',
  LinkStatus = 'mscx-framework:link_status',
  CallResult = 'mscx-framework:call_result',
  Signal = 'mscx-framework:signal',
  Event = 'mscx-framework:event',
}

export default abstract class ModuleEx extends MscxModule {
  constructor(fwCtx: MscxFrameworkContext, cleaner: MscxModuleCleaner, id: string) {
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
    logger.log('ModuleEx', 'onEvent: ', event, ...args)

    this.postMessage(FrameworkCommand.Event, event, ...args)
  }
}
