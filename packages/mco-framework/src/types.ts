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

export class McoServiceConnHolder {
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

export interface McoModuleContextFuncs {
  registerService(service: McoService): void

  unregisterService(service: McoService): void

  connectService(sId: string, connn: McoServiceConnn): McoServiceConnHolder | undefined

  disconnectService(sId: string, connn: McoServiceConnn): void

  invokeFunc(uri: string, ...args: any[]): Promise<any>

  connectSignal(uri: string, slot: McoServiceSlot): void

  disconnectSignal(uri: string, slot: McoServiceSlot): void
}
