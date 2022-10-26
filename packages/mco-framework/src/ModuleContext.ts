import McoModule from './Module'
import McoFrameworkContext from './privates/FrameworkContext'
import logger from './privates/logger'
import McoModuleCleaner from './privates/ModuleCleaner'
import McoService from './Service'
import {
  McoModuleContextFuncs,
  McoServiceConnnHolder,
  McoServiceConnn,
  McoServiceSlot,
  McoServiceSlotHolder,
} from './types'

export default class McoModuleContext implements McoModuleContextFuncs {
  constructor(module: McoModule, fwCtx: McoFrameworkContext, cleaner: McoModuleCleaner) {
    this.module = module
    this.fwCtx = fwCtx
    cleaner.bindClearFn(this.clearAll)
  }

  readonly module: McoModule
  private fwCtx: McoFrameworkContext
  private servs?: McoService[]
  private connns?: [string, McoServiceConnn][] = []
  private slots?: [string, McoServiceSlot][] = []

  get mId() {
    return this.module.mId
  }

  registerService(service: McoService) {
    logger.log('McoModuleContext.registerService', service, this.mId)

    const {fwCtx} = this

    const success = fwCtx.services.register(service)
    if (!success) return false

    if (!this.servs) this.servs = [service]
    else if (!this.servs.includes(service)) this.servs.push(service)

    return true
  }

  unregisterService(service: McoService) {
    logger.log('McoModuleContext.unregisterService', service, this.mId)

    const {fwCtx} = this

    fwCtx.services.unregister(service)
    this.servs = this.servs?.filter(el => el !== service)
  }

  connectService(sId: string, connn: McoServiceConnn): McoServiceConnnHolder | undefined {
    logger.log('McoModuleContext.connectService', sId, connn, this.mId)

    const {fwCtx} = this

    const l = fwCtx.services.connect(sId, connn)
    if (!l) return

    if (!this.connns) this.connns = [[sId, connn]]
    else if (!this.connns.find(el => el[0] === sId && el[1] === connn)) {
      this.connns.push([sId, connn])
    }

    fwCtx.services.getService(sId) && connn(true, sId)

    return new McoServiceConnnHolder(this, sId, connn)
  }

  disconnectService(sId: string, connn: McoServiceConnn) {
    logger.log('McoModuleContext.disconnectService', sId, connn, this.mId)

    const {fwCtx} = this

    fwCtx.services.disconnect(sId, connn)

    this.connns = this.connns?.filter(el => el[0] === sId && el[1] === connn)
  }

  async invokeService(uri: string, ...args: any[]) {
    logger.log('McoModuleContext.invokeFunc', uri, ...args, this.mId)

    const {fwCtx} = this

    return fwCtx.services.invoke(uri, ...args)
  }

  connectSignal(uri: string, slot: McoServiceSlot): McoServiceSlotHolder | undefined {
    logger.log('McoModuleContext.connectSignal', uri, slot, this.mId)

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
    logger.log('McoModuleContext.disconnectSignal', uri, slot, this.mId)

    const {fwCtx} = this

    fwCtx.services.disconnectSignal(uri, slot)

    this.slots = this.slots?.filter(el => el[0] === uri && el[1] === slot)
  }

  private clearAll = () => {
    logger.log('McoModuleContext.clearAll', this.mId)

    const {fwCtx} = this

    this.slots?.forEach(el => this.disconnectSignal(el[0], el[1]))
    this.slots = undefined

    this.connns?.forEach(el => this.disconnectService(el[0], el[1]))
    this.connns = undefined

    this.servs?.forEach(el => fwCtx.services.unregister(el))
    this.servs = undefined
  }
}
