import MxModule from './Module'
import MxModuleContext from '../ModuleContext'
import {MxDestructor} from '../types'

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
  InvokeCtx = 'mx-sdk:invoke_ctx',
  OnCtxEvent = 'mx-sdk:on_ctx_event',
  OffCtxEvent = 'mx-sdk:off_ctx_event',
  EmitCtxEvent = 'mx-sdk:emit_ctx_event',
}

enum FrameworkCommand {
  Ready = 'mx-framework:ready',
  LinkStatus = 'mx-framework:link_status',
  InvokeResult = 'mx-framework:invole_result',
  Signal = 'mx-framework:signal',
  Event = 'mx-framework:event',
  CtxEvent = 'mx-framework:ex_event',
}

export default abstract class MxExModule extends MxModule {
  constructor(ctx: MxModuleContext, destructor: MxDestructor) {
    super(ctx, destructor)
  }

  private _enabled = false

  get enabled() {
    return this._enabled
  }

  onCommand(cmd: SdkCommand, ...args: any[]) {
    this.ctx.logger.log('MxExModule', 'onCommand: ', cmd, ...args)

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
      case SdkCommand.InvokeCtx:
        {
          const [id, name, ...params] = args
          this.onInvokeCtx(id, name, ...params)
        }
        break
      case SdkCommand.OnCtxEvent:
        {
          const [event] = args
          this.ctx.onCtxEvent(event, this.handleCtxEvent)
        }
        break
      case SdkCommand.OffCtxEvent:
        {
          const [event] = args
          this.ctx.offCtxEvent(event, this.handleCtxEvent)
        }
        break
      case SdkCommand.EmitCtxEvent:
        {
          const [event, ...params] = args
          this.ctx.emitCtxEvent(event, ...params)
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
    this.ctx.logger.log('MxExModule', 'onEvent: ', ...args)

    this.postMessage(FrameworkCommand.Event, ...args)
  }

  private async onInvokeCtx(id: string, name: string, ...args: any[]) {
    const result = await this.ctx.invokeCtx(name, ...args)
    this.postMessage(FrameworkCommand.InvokeResult, id, result)
  }

  private handleCtxEvent = (...args: any[]) => {
    this.ctx.logger.log('MxExModule', 'handleCtxEvent: ', ...args)

    this.postMessage(FrameworkCommand.CtxEvent, ...args)
  }

  protected unload() {
    super.unload()
    this._enabled = false
  }
}
