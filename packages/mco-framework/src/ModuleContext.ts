import McoModule from './Module'
import McoFrameworkContext from './privates/FrameworkContext'
import McoModuleCleaner from './privates/ModuleCleaner'
import McoService from './Service'
import {McoModuleContextFuncs, McoServiceConnn, McoServiceSlot} from './types'

export default class McoModuleContext implements McoModuleContextFuncs {
  constructor(module: McoModule, fwCtx: McoFrameworkContext, cleaner: McoModuleCleaner) {
    this.module = module
    this.fwCtx = fwCtx
    cleaner.bindClearFn(this.clearAll)
  }

  readonly module: McoModule
  private fwCtx: McoFrameworkContext
  private serviceRegs?: McoService[]

  getModule(mId: string) {
    const {fwCtx} = this

    return fwCtx.modules?.getModule(mId)
  }

  loadModule(mId: string) {
    const {fwCtx} = this
    const module = fwCtx.modules.load(mId)

    return module
  }

  loadIFrameModule(mId: string, container: HTMLIFrameElement) {
    const {fwCtx} = this
    const module = fwCtx.modules.loadIFrame(mId, container)

    return module
  }

  unloadModule(mId: string) {
    const {fwCtx} = this

    fwCtx.modules.unload(mId)
  }

  registerService(service: McoService) {
    const {fwCtx} = this

    const success = fwCtx.services.register(service)
    if (!success) return false

    if (!this.serviceRegs) this.serviceRegs = [service]
    else if (!this.serviceRegs.includes(service)) this.serviceRegs.push(service)

    return true
  }

  unregisterService(service: McoService) {
    const {fwCtx} = this

    fwCtx.services.unregister(service)
    this.serviceRegs = this.serviceRegs?.filter(el => el !== service)
  }

  connectService(sId: string, connn: McoServiceConnn) {}

  disconnectService(sId: string, connn: McoServiceConnn) {}

  async invokeFunc(uri: string, ...args: any[]) {}

  connectSignal(uri: string, slot: McoServiceSlot) {}

  disconnectSignal(uri: string, slot: McoServiceSlot) {}

  private clearAll = () => {
    const {fwCtx} = this

    this.serviceRegs?.forEach(service => fwCtx.services.unregister(service))
    this.serviceRegs = undefined
  }
}
