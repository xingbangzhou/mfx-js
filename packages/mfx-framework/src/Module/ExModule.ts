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
  InvokeEx = 'yoy-sdk:invoke_ex',
  OnExEvent = 'yoy-sdk:on_ex_event',
  OffExEvent = 'yoy-sdk:off_ex_event',
  EmitExEvent = 'yoy-sdk:emit_ex_event',
}

enum FrameworkCommand {
  Ready = 'mx-framework:ready',
  LinkStatus = 'mx-framework:link_status',
  InvokeResult = 'mx-framework:invole_result',
  Signal = 'mx-framework:signal',
  Event = 'mx-framework:event',
  ExEvent = 'yoy-framework:ex_event',
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
          this.ctx.addEventListener(event, this.handleEvent)
        }
        break
      case SdkCommand.RemoveEventListener:
        {
          const [event] = args
          this.ctx.removeEventListener(event, this.handleEvent)
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
      case SdkCommand.InvokeEx:
        {
          const [id, name, ...params] = args
          this.onInvokeEx(id, name, ...params)
        }
        break
      case SdkCommand.OnExEvent:
        {
          const [event] = args
          this.ctx.onExEvent(event, this.handleExEvent)
        }
        break
      case SdkCommand.OffExEvent:
        {
          const [event] = args
          this.ctx.offExEvent(event, this.handleExEvent)
        }
        break
      case SdkCommand.EmitExEvent:
        {
          const [event, ...params] = args
          this.ctx.emitExEvent(event, ...params)
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

  private handleEvent = (...args: any[]) => {
    this.ctx.logger.log('ExModule', 'onEvent: ', ...args)

    this.postMessage(FrameworkCommand.Event, ...args)
  }

  private async onInvokeEx(id: string, name: string, ...args: any[]) {
    const result = await this.ctx.invokeEx(name, ...args)
    this.postMessage(FrameworkCommand.InvokeResult, id, result)
  }

  private handleExEvent = (...args: any[]) => {
    this.ctx.logger.log('ExModule', 'onExEvent: ', ...args)

    this.postMessage(FrameworkCommand.ExEvent, ...args)
  }

  protected unload() {
    super.unload()
    this._enabled = false
  }
}
