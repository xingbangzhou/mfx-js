import MfxModule from './Module'
import MfxModuleContext from './ModuleContext'
import MfxDestructor from '../Destructor'

enum SdkCommand {
  Ready = 'mfx-sdk:ready',
  Link = 'mfx-sdk:link',
  Unlink = 'mfx-sdk:unlink',
  ConnectSignal = 'mfx-sdk:connect_signal',
  DisconnectSignal = 'mfx-sdk:disconnect_signal',
  Invoke = 'mfx-sdk:invoke',
  AddEventListener = 'mfx-sdk:add_event_listener',
  RemoveEventListener = 'mfx-sdk:remove_event_listener',
  PostEvent = 'mfx-sdk:post_event',
  Log = 'mfx-sdk:log',
  CtxInvoke = 'mfx-sdk:ctx_invoke',
  CtxOnEvent = 'mfx-sdk:ctx_on_event',
  CtxOffEvent = 'mfx-sdk:ctx_off_event',
  CtxEmitEvent = 'mfx-sdk:ctx_emit_event',
}

enum FrameworkCommand {
  Ready = 'mfx-framework:ready',
  LinkStatus = 'mfx-framework:link_status',
  InvokeResult = 'mfx-framework:invole_result',
  Signal = 'mfx-framework:signal',
  Event = 'mfx-framework:event',
  CtxEvent = 'mfx-framework:ctx_event',
}

export default abstract class MfxExModule extends MfxModule {
  constructor(ctx: MfxModuleContext, destructor: MfxDestructor) {
    super(ctx, destructor)
  }

  private _enabled = false

  get enabled() {
    return this._enabled
  }

  onCommand(cmd: SdkCommand, ...args: any[]) {
    this.ctx.logger.log('MfxExModule', 'onCommand: ', cmd, ...args)

    switch (cmd) {
      case SdkCommand.Ready:
        this._enabled = true
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
      case SdkCommand.CtxInvoke:
        {
          const [id, name, ...params] = args
          this.onInvokeCtx(id, name, ...params)
        }
        break
      case SdkCommand.CtxOnEvent:
        {
          const [event] = args
          this.ctx.ctxOnEvent(event, this.handleCtxEvent)
        }
        break
      case SdkCommand.CtxOffEvent:
        {
          const [event] = args
          this.ctx.ctxOffEvent(event, this.handleCtxEvent)
        }
        break
      case SdkCommand.CtxEmitEvent:
        {
          const [event, ...params] = args
          this.ctx.ctxEmitEvent(event, ...params)
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
    this.postMessage(FrameworkCommand.InvokeResult, id, result)
  }

  private onLinkStatus = (on: boolean, clazz: string) => {
    this.postMessage(FrameworkCommand.LinkStatus, on, clazz)
  }

  private onSignal = (...args: any[]) => {
    this.postMessage(FrameworkCommand.Signal, ...args)
  }

  private handleEvent = (...args: any[]) => {
    this.ctx.logger.log('MfxExModule', 'onEvent: ', ...args)

    this.postMessage(FrameworkCommand.Event, ...args)
  }

  private async onInvokeCtx(id: string, name: string, ...args: any[]) {
    const result = await this.ctx.ctxInvoke(name, ...args)
    this.postMessage(FrameworkCommand.InvokeResult, id, result)
  }

  private handleCtxEvent = (...args: any[]) => {
    this.ctx.logger.log('MfxExModule', 'handleCtxEvent: ', ...args)

    this.postMessage(FrameworkCommand.CtxEvent, ...args)
  }

  protected unload() {
    super.unload()
    this._enabled = false
  }
}
