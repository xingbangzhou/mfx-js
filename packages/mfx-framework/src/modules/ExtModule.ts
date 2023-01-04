import MfxFrameworkContext from '../privates/FrameworkContext'
import MfxModule from '../Module'
import MfxModuleCleaner from '../privates/ModuleCleaner'

enum SdkCommand {
  Ready = 'mfx-sdk:ready',
  Link = 'mfx-sdk:link',
  Unlink = 'mfx-sdk:unlink',
  ConnectSignal = 'mfx-sdk:connect_signal',
  DisconnectSignal = 'mfx-sdk:disconnect_signal',
  Invoke = 'mfx-sdk:invoke',
  Method = 'mfx-sdk:method',
  PostEvent = 'mfx-sdk:post_event',
  AddEventListener = 'mfx-sdk:add_event_listener',
  RemoveEventListener = 'mfx-sdk:remove_event_listener',
}

enum FrameworkCommand {
  Ready = 'mfx-framework:::ready',
  LinkStatus = 'mfx-framework:::link_status',
  CallResult = 'mfx-framework:::call_result',
  Signal = 'mfx-framework:::signal',
  Event = 'mfx-framework:::event',
}

export default abstract class ExtModule extends MfxModule {
  constructor(fwCtx: MfxFrameworkContext, cleaner: MfxModuleCleaner, id: string) {
    super(fwCtx, cleaner, id)
  }

  onCommand(cmd: string, ...args: any[]) {
    this.ctx.logger.log('onCommand: ', cmd, ...args)

    switch (cmd) {
      case SdkCommand.Ready:
        this.imReady()
        break
      case SdkCommand.Link:
        {
          const [clazz] = args
          this.ctx.link(clazz, this.onLinkStatus)
        }
        break
      case SdkCommand.Unlink:
        {
          const [clazz] = args
          this.ctx.unlink(clazz, this.onLinkStatus)
        }
        break
      case SdkCommand.Invoke:
        {
          const [id, clazz, name, ...params] = args
          this.onInvoke(id, clazz, name, ...params)
        }
        break
      case SdkCommand.Method:
        {
          const [id, name, ...params] = args
          this.onMethod(id, name, ...params)
        }
        break
      case SdkCommand.ConnectSignal:
        {
          const [clazz, signal] = args
          this.ctx.connectSignal(clazz, signal, this.onSignal)
        }
        break
      case SdkCommand.DisconnectSignal:
        {
          const [clazz, signal] = args
          this.ctx.disconnectSignal(clazz, signal, this.onSignal)
        }
        break
      case SdkCommand.PostEvent:
        {
          const [event, ...params] = args
          this.ctx.postEvent(event, ...params)
        }
        break
      case SdkCommand.AddEventListener:
        {
          const [event] = args
          this.ctx.addEventListener(event, this.onEvent)
        }
        break
      case SdkCommand.RemoveEventListener:
        {
          const [event] = args
          this.ctx.removeEventListener(event, this.onEvent)
        }
        break
      default:
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

  private onSignal = (...args: any[]) => {
    this.postMessage(FrameworkCommand.Signal, ...args)
  }

  private onEvent = (...args: any[]) => {
    this.ctx.logger.log('onEvent: ', ...args)

    this.postMessage(FrameworkCommand.Event, ...args)
  }
}
