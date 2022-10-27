import {McoEventListenerHolder} from '.'
import McoModule from './Module'
import McoFrameworkContext from './privates/FrameworkContext'
import logger from './privates/logger'
import McoModuleCleaner from './privates/ModuleCleaner'
import McoService from './Service'
import {
  McoModuleContextFuncs,
  McoServiceLinkerHolder,
  McoServiceLinker,
  McoServiceSlot,
  McoServiceSlotHolder,
  McoEventListener,
} from './types'

export default class McoModuleContext implements McoModuleContextFuncs {
  constructor(module: McoModule, fwCtx: McoFrameworkContext, cleaner: McoModuleCleaner) {
    this.module = module
    this.fwCtx = fwCtx
    cleaner.bindClear(this.clearAll)
  }

  readonly module: McoModule
  private fwCtx: McoFrameworkContext
  private srvs?: McoService[]
  private lnks?: [string, McoServiceLinker][]
  private slots?: [string, McoServiceSlot][]
  private listeners?: [string, McoEventListener][]

  getMId() {
    return this.module.mId
  }

  register(service: McoService) {
    logger.log('McoModuleContext.registerService', service, this.module.mId)

    const {fwCtx} = this

    const success = fwCtx.services.register(service)
    if (!success) return false

    if (!this.srvs) this.srvs = [service]
    else if (!this.srvs.includes(service)) this.srvs.push(service)

    return true
  }

  unregister(service: McoService) {
    logger.log('McoModuleContext.unregisterService', service, this.module.mId)

    const {fwCtx} = this

    fwCtx.services.unregister(service)
    this.srvs = this.srvs?.filter(el => el !== service)
  }

  link(sId: string, connn: McoServiceLinker): McoServiceLinkerHolder | undefined {
    logger.log('McoModuleContext.connectService', sId, connn, this.module.mId)

    const {fwCtx} = this

    const l = fwCtx.services.link(sId, connn)
    if (!l) return

    if (!this.lnks) this.lnks = [[sId, connn]]
    else if (!this.lnks.find(el => el[0] === sId && el[1] === connn)) {
      this.lnks.push([sId, connn])
    }

    fwCtx.services.getService(sId) && connn(true, sId)

    return new McoServiceLinkerHolder(this, sId, connn)
  }

  unlink(sId: string, connn: McoServiceLinker) {
    logger.log('McoModuleContext.disconnectService', sId, connn, this.module.mId)

    const {fwCtx} = this

    fwCtx.services.unlink(sId, connn)

    this.lnks = this.lnks?.filter(el => el[0] === sId && el[1] === connn)
  }

  async invoke(uri: string, ...args: any[]) {
    logger.log('McoModuleContext.invokeFunc', uri, ...args, this.module.mId)

    const {fwCtx} = this

    return fwCtx.services.invoke(uri, ...args)
  }

  connectSignal(uri: string, slot: McoServiceSlot): McoServiceSlotHolder | undefined {
    logger.log('McoModuleContext.connectSignal', uri, slot, this.module.mId)

    const {fwCtx} = this

    const l = fwCtx.services.connectSignal(uri, slot)
    if (!l) return

    if (!this.slots) this.slots = [[uri, slot]]
    else if (!this.slots.find(el => el[0] === uri && el[1] === slot)) {
      this.slots.push([uri, slot])
    }

    return new McoServiceSlotHolder(this, uri, slot)
  }

  disconnectSignal(uri: string, slot: McoServiceSlot) {
    logger.log('McoModuleContext.disconnectSignal', uri, slot, this.module.mId)

    const {fwCtx} = this

    fwCtx.services.disconnectSignal(uri, slot)

    this.slots = this.slots?.filter(el => el[0] === uri && el[1] === slot)
  }

  postEvent(event: string, ...args: any[]) {
    logger.log('McoModuleContext.postEvent', event, ...args)

    const {fwCtx} = this

    fwCtx.events.post(event, ...args)
  }

  addEventListener(event: string, listener: McoEventListener): McoEventListenerHolder | undefined {
    logger.log('McoModuleContext.addEventListener', event, listener, this.module.mId)

    const {fwCtx} = this

    const l = fwCtx.events.addListener(event, listener)
    if (!l) return

    if (!this.listeners) this.listeners = [[event, listener]]
    else if (!this.listeners.find(el => el[0] === event && el[1] === listener)) {
      this.listeners.push([event, listener])
    }

    return new McoEventListenerHolder(this, event, listener)
  }

  removeEventListener(event: string, listener: McoEventListener) {
    logger.log('McoModuleContext.removeEventListener', event, listener, this.module.mId)

    const {fwCtx} = this

    fwCtx.events.removeListener(event, listener)

    this.listeners = this.listeners?.filter(el => el[0] === event && el[1] === listener)
  }

  private clearAll = () => {
    logger.log('McoModuleContext.clearAll', this.module.mId)

    const {fwCtx} = this

    this.listeners?.forEach(el => fwCtx.events.removeListener(el[0], el[1]))
    this.listeners = undefined

    this.slots?.forEach(el => fwCtx.services.disconnectSignal(el[0], el[1]))
    this.slots = undefined

    this.lnks?.forEach(el => fwCtx.services.unlink(el[0], el[1]))
    this.lnks = undefined

    this.srvs?.forEach(el => fwCtx.services.unregister(el))
    this.srvs = undefined
  }
}
