import {
  MfxContextExecutor,
  MfxEventListener,
  MfxLinkHandler,
  MfxModuleContextFuncs,
  MfxService,
  MfxSignalHandler,
} from '@mfx0/base'
import FrameContext from './privates/FrameContext'

enum EApi {
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
  setExecutor = 'setExecutor',
  execute = 'execute',
}

export default class Mfxsdk implements MfxModuleContextFuncs {
  constructor() {
    // 主应用启动框架标志
    if ((window as any)['_MfxFramework_']) return
    // Frame Module
    if (window.top !== window) {
      this.active(FrameContext.instance())
    }
  }

  private ctx?: MfxModuleContextFuncs
  private blockApis?: [string, any[]][]

  // Warning: 激活上下文
  active(ctx: MfxModuleContextFuncs) {
    this.ctx = ctx
    if (!this.ctx) return

    this.blockApis?.forEach(([api, args]) => this.runApi0(ctx, api, ...args))
    this.blockApis = undefined
  }

  // YFModuleContextFuncs
  register(service: MfxService) {
    this.runApi(EApi.register, service)
  }

  unregister(service: MfxService) {
    this.runApi(EApi.unregister, service)
  }

  link(clazz: string, linker: MfxLinkHandler) {
    this.runApi(EApi.link, clazz, linker)
  }

  unlink(clazz: string, linker: MfxLinkHandler): void {
    this.runApi(EApi.unlink, clazz, linker)
  }

  invoke(clazz: string, name: string, ...args: any[]): Promise<any> {
    return new Promise(resolve => {
      this.runApi(EApi.invoke, resolve, clazz, name, ...args)
    })
  }

  connectSignal(clazz: string, signal: string, slot: MfxSignalHandler) {
    this.runApi(EApi.connectSignal, clazz, signal, slot)
  }

  disconnectSignal(clazz: string, signal: string, slot: MfxSignalHandler): void {
    this.runApi(EApi.disconnectSignal, clazz, signal, slot)
  }

  postEvent(event: string, ...args: any[]): void {
    this.runApi(EApi.postEvent, event, ...args)
  }

  addEventListener(event: string, listener: MfxEventListener) {
    this.runApi(EApi.addEventListener, event, listener)
  }

  removeEventListener(event: string, listener: MfxEventListener): void {
    this.runApi(EApi.removeEventListener, event, listener)
  }

  setExecutor(name: string, executor?: MfxContextExecutor) {
    this.runApi(EApi.setExecutor, name, executor)
  }

  async execute(name: string, ...args: any[]) {
    return new Promise(resolve => {
      this.runApi(EApi.execute, resolve, name, ...args)
    })
  }

  private runApi(api: EApi, ...args: any[]) {
    if (this.ctx) {
      this.runApi0(this.ctx, api, ...args)
      return
    }
    if (!this.blockApis) this.blockApis = [[api, args]]
    else this.blockApis.push([api, args])
  }

  private runApi0(ctx: MfxModuleContextFuncs, api: string, ...args: any[]) {
    switch (api) {
      case EApi.register:
        {
          const [service] = args
          ctx.register(service)
        }
        break
      case EApi.unregister:
        {
          const [service] = args
          ctx.unregister(service)
        }
        break
      case EApi.link:
        {
          const [clazz, linker] = args
          ctx.link(clazz, linker)
        }
        break
      case EApi.unlink:
        {
          const [clazz, linker] = args
          ctx.unlink(clazz, linker)
        }
        break
      case EApi.invoke:
        {
          const [resolve, clazz, name, ...params] = args
          ctx.invoke(clazz, name, ...params).then(data => resolve(data))
        }
        break
      case EApi.connectSignal:
        {
          const [clazz, signal, slot] = args
          ctx.connectSignal(clazz, signal, slot)
        }
        break
      case EApi.disconnectSignal:
        {
          const [clazz, signal, slot] = args
          ctx.disconnectSignal(clazz, signal, slot)
        }
        break
      case EApi.postEvent:
        {
          const [event, ...params] = args
          ctx.postEvent(event, ...params)
        }
        break
      case EApi.addEventListener:
        {
          const [event, listener] = args
          ctx.addEventListener(event, listener)
        }
        break
      case EApi.removeEventListener:
        {
          const [event, listener] = args
          ctx.removeEventListener(event, listener)
        }
        break
      case EApi.setExecutor:
        {
          const [name, executor] = args
          ctx.setExecutor(name, executor)
        }
        break
      case EApi.execute:
        {
          const [resolve, name, ...params] = args
          ctx.execute(name, ...params).then(data => resolve(data))
        }
        break
      default:
        break
    }
  }
}
