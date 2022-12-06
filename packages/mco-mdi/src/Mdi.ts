import FrameContext from './privates/FrameContext'
import Service from './Service'
import {McoEventListener, McoModuleContextFuncs, McoServiceLinker, McoServiceSlot} from './types'

enum EMdi {
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

export default class McoMdi implements McoModuleContextFuncs {
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
    this.ctx = ctx
    if (!this.ctx) return

    this.blockApis?.forEach(([api, args]) => this.runApi0(ctx, api, ...args))
    this.blockApis = undefined
  }

  // McoModuleContextFuncs
  register(service: Service) {
    this.runApi(EMdi.register, service)
  }

  unregister(service: Service) {
    this.runApi(EMdi.unregister, service)
  }

  link(clazz: string, linker: McoServiceLinker) {
    this.runApi(EMdi.link, clazz, linker)
  }

  unlink(clazz: string, linker: McoServiceLinker): void {
    this.runApi(EMdi.unlink, clazz, linker)
  }

  invoke(clazz: string, name: string, ...args: any[]): Promise<any> {
    return new Promise(resolve => {
      this.runApi(EMdi.invoke, resolve, clazz, name, ...args)
    })
  }

  connectSignal(clazz: string, signal: string, slot: McoServiceSlot) {
    this.runApi(EMdi.connectSignal, clazz, signal, slot)
  }

  disconnectSignal(clazz: string, signal: string, slot: McoServiceSlot): void {
    this.runApi(EMdi.disconnectSignal, clazz, signal, slot)
  }

  postEvent(event: string, ...args: any[]): void {
    this.runApi(EMdi.postEvent, event, ...args)
  }

  addEventListener(event: string, listener: McoEventListener) {
    this.runApi(EMdi.addEventListener, event, listener)
  }

  removeEventListener(event: string, listener: McoEventListener): void {
    this.runApi(EMdi.removeEventListener, event, listener)
  }

  private runApi(api: EMdi, ...args: any[]) {
    if (this.ctx) {
      this.runApi0(this.ctx, api, ...args)
      return
    }
    if (!this.blockApis) this.blockApis = [[api, args]]
    else this.blockApis.push([api, args])
  }

  private runApi0(ctx: McoModuleContextFuncs, api: string, ...args: any[]) {
    switch (api) {
      case EMdi.register:
        {
          const [service] = args
          ctx.register(service)
        }
        break
      case EMdi.unregister:
        {
          const [service] = args
          ctx.unregister(service)
        }
        break
      case EMdi.link:
        {
          const [clazz, linker] = args
          ctx.link(clazz, linker)
        }
        break
      case EMdi.unlink:
        {
          const [clazz, linker] = args
          ctx.unlink(clazz, linker)
        }
        break
      case EMdi.invoke:
        {
          const [resolve, clazz, name, ...params] = args
          ctx.invoke(clazz, name, ...params).then(data => resolve(data))
        }
        break
      case EMdi.connectSignal:
        {
          const [clazz, signal, slot] = args
          ctx.connectSignal(clazz, signal, slot)
        }
        break
      case EMdi.disconnectSignal:
        {
          const [clazz, signal, slot] = args
          ctx.disconnectSignal(clazz, signal, slot)
        }
        break
      case EMdi.postEvent:
        {
          const [event, ...params] = args
          ctx.postEvent(event, ...params)
        }
        break
      case EMdi.addEventListener:
        {
          const [event, listener] = args
          ctx.addEventListener(event, listener)
        }
        break
      case EMdi.removeEventListener:
        {
          const [event, listener] = args
          ctx.removeEventListener(event, listener)
        }
        break
      default:
        break
    }
  }
}
