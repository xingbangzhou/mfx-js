import McoService from './Service'

export interface McoServiceFunc {
  (...args: any[]): any
}

export interface McoServiceSlot {
  (uri: string, ...args: any[]): void
}

export interface McoServiceConnn {
  (on: boolean, sId: string): void
}

export class McoServiceConnnHolder {
  constructor(ctx: McoModuleContextFuncs, sId: string, connn: McoServiceConnn) {
    this.ctx = ctx
    this.sId = sId
    this.connn = connn
  }

  ctx?: McoModuleContextFuncs
  sId?: string
  connn?: McoServiceConnn

  disconnect() {
    this.sId && this.connn && this.ctx?.disconnectService(this.sId, this.connn)
    this.sId = undefined
    this.connn = undefined
    this.ctx = undefined
  }
}

export class McoServiceSlotHolder {
  constructor(ctx: McoModuleContextFuncs, uri: string, slot: McoServiceSlot) {
    this.ctx = ctx
    this.uri = uri
    this.slot = slot
  }

  ctx?: McoModuleContextFuncs
  uri?: string
  slot?: McoServiceSlot

  disconnect() {
    this.uri && this.slot && this.ctx?.disconnectSignal(this.uri, this.slot)
    this.uri = undefined
    this.slot = undefined
    this.ctx = undefined
  }
}

export interface McoModuleContextFuncs {
  resize(width: number, height: number): void

  registerService(service: McoService): void

  unregisterService(service: McoService): void

  connectService(sId: string, connn: McoServiceConnn): McoServiceConnnHolder

  disconnectService(sId: string, connn: McoServiceConnn): void

  invokeFunc(uri: string, ...args: any[]): Promise<any>

  connectSignal(uri: string, slot: McoServiceSlot): McoServiceSlotHolder

  disconnectSignal(uri: string, slot: McoServiceSlot): void
}
