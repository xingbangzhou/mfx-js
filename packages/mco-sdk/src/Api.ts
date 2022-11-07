import FrameContext from './privates/FrameContext'
import Service from './Service'
import {
  McoEventListener,
  McoEventListenerHolder,
  McoModuleContextFuncs,
  McoServiceLinker,
  McoServiceLinkerHolder,
  McoServiceSlot,
  McoServiceSlotHolder,
} from './types'

enum EApi {
  resize = 'resize',
  register = 'register',
  unregister = 'unregister',
  link = 'link',
  unlink = 'unlink',
  invoke = 'invoke',
  connectSignal = 'connectSignal',
  disconnectSignal = 'disconnectSignal',
  postEvent = 'postEvent',
  addEventListener = 'addEventListener',
  removeEventListener = 'removeEventListener',
}

export default class McoApi implements McoModuleContextFuncs {
  constructor() {
    // 主应用启动框架标志
    if (window['__McoFramework__']) return
    // Frame Module
    if (window.top !== window) {
      this.active(FrameContext.instance())
    }
  }

  private ctx?: McoModuleContextFuncs
  private blockApis?: [string, any[]][]

  // Warning: 激活上下文
  active(ctx: McoModuleContextFuncs) {
    if (this.ctx || !ctx) return
    console.log('McoApi active!')
    this.ctx = ctx

    this.blockApis?.forEach(([api, args]) => this.runCtx(ctx, api, ...args))
    this.blockApis = undefined
  }

  /**
   * 对外接口
   */
  resize(width: number, height: number) {
    this.runApi(EApi.resize, width, height)
  }

  register(service: Service) {
    this.runApi(EApi.register, service)
  }

  unregister(service: Service) {
    this.runApi(EApi.unregister, service)
  }

  link(sId: string, connn: McoServiceLinker): McoServiceLinkerHolder | undefined {
    this.runApi(EApi.link, sId, connn)

    return new McoServiceLinkerHolder(this, sId, connn)
  }

  unlink(sId: string, connn: McoServiceLinker): void {
    this.runApi(EApi.unlink, sId, connn)
  }

  invoke(uri: string, ...args: any[]): Promise<any> {
    return new Promise(resolve => {
      this.runApi(EApi.invoke, resolve, uri, ...args)
    })
  }

  connectSignal(uri: string, slot: McoServiceSlot): McoServiceSlotHolder | undefined {
    this.runApi(EApi.connectSignal, uri, slot)

    return new McoServiceSlotHolder(this, uri, slot)
  }

  disconnectSignal(uri: string, slot: McoServiceSlot): void {
    this.runApi(EApi.disconnectSignal, uri, slot)
  }

  postEvent(event: string, ...args: any[]): void {
    this.runApi(EApi.postEvent, event, ...args)
  }

  addEventListener(event: string, listener: McoEventListener): McoEventListenerHolder | undefined {
    this.runApi(EApi.addEventListener, event, listener)

    return new McoEventListenerHolder(this, event, listener)
  }

  removeEventListener(event: string, listener: McoEventListener): void {
    this.runApi(EApi.removeEventListener, event, listener)
  }

  private runApi(api: EApi, ...args: any[]) {
    if (this.ctx) {
      this.runCtx(this.ctx, api, ...args)
      return
    }
    if (!this.blockApis) this.blockApis = [[api, args]]
    else this.blockApis.push([api, args])
  }

  private runCtx(ctx: McoModuleContextFuncs, api: string, ...args: any[]) {
    switch (api) {
      case EApi.resize:
        ctx.resize(args[0], args[1])
        break
      case EApi.register:
        ctx.register(args[0])
        break
      case EApi.unregister:
        ctx.unregister(args[0])
        break
      case EApi.link:
        ctx.link(args[0], args[1])
        break
      case EApi.unlink:
        ctx.unlink(args[0], args[1])
        break
      case EApi.invoke:
        const [resolve, uri, ...params] = args
        ctx.invoke(uri, ...params).then(data => resolve(data))
        break
      case EApi.connectSignal:
        ctx.connectSignal(args[0], args[1])
        break
      case EApi.disconnectSignal:
        ctx.disconnectSignal(args[0], args[1])
        break
      case EApi.postEvent:
        ctx.postEvent(args[0], ...args[1])
        break
      case EApi.addEventListener:
        ctx.addEventListener(args[0], args[1])
        break
      case EApi.removeEventListener:
        ctx.removeEventListener(args[0], args[1])
        break
      default:
        break
    }
  }
}
