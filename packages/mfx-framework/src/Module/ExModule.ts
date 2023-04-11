import MxModule from './Module'
import MxFrameworkContext from '../privates/FrameworkContext'
import MxModuleDestructor from '../privates/ModuleDestructor'

enum SdkCommand {
  Ready = 'mx-sdk:ready',
  Link = 'mx-sdk:link',
  Unlink = 'mx-sdk:unlink',
  ConnectSignal = 'mx-sdk:connect_signal',
  DisconnectSignal = 'mx-sdk:disconnect_signal',
  Invoke = 'mx-sdk:invoke',
  AddEventListener = 'mx-sdk:add_event_listener',
  RemoveEventListener = 'mx-sdk:remove_event_listener',
  PostEvent = 'mx-sdk:post_event',
  Log = 'mx-sdk:log',
}

enum FrameworkCommand {
  Ready = 'mx-framework:ready',
  LinkStatus = 'mx-framework:link_status',
  InvokeResult = 'mx-framework:invole_Result',
  Signal = 'mx-framework:signal',
  Event = 'mx-framework:event',
}

export default abstract class MxExModule extends MxModule {
  constructor(fwCtx: MxFrameworkContext, destructor: MxModuleDestructor, id: string) {
    super(fwCtx, destructor, id)
  }

  private _enabled = false

  get enabled() {
    return this._enabled
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
      case SdkCommand.PostEvent:
        {
          const [event, ...params] = args
          this.ctx.postEvent(event, ...params)
        }
        break
      case SdkCommand.Log:
        {
          const [name, ...params] = args
          this.ctx.log(name, ...params)
        }
        break
    }
  }

  protected imReady() {
    this.postMessage(FrameworkCommand.Ready)
    this._enabled = true
  }

  protected abstract postMessage(cmd: string, ...args: any[]): void

  private async onInvoke(id: string, clazz: string, name: string, ...args: any[]) {
    const result = await this.ctx.invoke(clazz, name, ...args)
    this.postMessage(FrameworkCommand.InvokeResult, id, result)
  }

  private onLinkStatus = (on: boolean, clazz: string) => {
    this.postMessage(FrameworkCommand.LinkStatus, on, clazz)
  }

  private onSignal = (...args: any[]) => {
    this.postMessage(FrameworkCommand.Signal, ...args)
  }

  private onEvent = (...args: any[]) => {
    this.ctx.logger.log('ExModule', 'onEvent: ', ...args)

    this.postMessage(FrameworkCommand.Event, ...args)
  }

  protected unload() {
    super.unload()
    this._enabled = false
  }
}
