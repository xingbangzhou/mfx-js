import McoService from './Service'

export interface McoServiceLinker {
  (on: boolean, sId: string): void
}

export class McoServiceLinkerHolder {
  constructor(ctx: McoModuleContextFuncs, sId: string, connn: McoServiceLinker) {
    this.ctx = ctx
    this.sId = sId
    this.connn = connn
  }

  ctx?: McoModuleContextFuncs
  sId?: string
  connn?: McoServiceLinker

  off() {
    this.sId && this.connn && this.ctx?.unlink(this.sId, this.connn)
    this.sId = undefined
    this.connn = undefined
    this.ctx = undefined
  }
}

export interface McoServiceInvoke {
  (...args: any[]): any
}

export interface McoServiceSlot {
  (uri: string, ...args: any[]): void
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

  off() {
    this.uri && this.slot && this.ctx?.disconnectSignal(this.uri, this.slot)
    this.uri = undefined
    this.slot = undefined
    this.ctx = undefined
  }
}

export interface McoEventListener {
  (event: string, ...args: any[]): void
}

export class McoEventListenerHolder {
  constructor(ctx: McoModuleContextFuncs, event: string, listener: McoEventListener) {
    this.ctx = ctx
    this.event = event
    this.listener = listener
  }

  ctx?: McoModuleContextFuncs
  event?: string
  listener?: McoEventListener

  off() {
    this.event && this.listener && this.ctx?.removeEventListener(this.event, this.listener)
    this.event = undefined
    this.listener = undefined
    this.ctx = undefined
  }
}

export interface McoModuleContextFuncs {
  getMId(): Promise<string>

  resize(width: number, height: number): void

  register(service: McoService): void
  unregister(service: McoService): void

  link(sId: string, connn: McoServiceLinker): McoServiceLinkerHolder | undefined
  unlink(sId: string, connn: McoServiceLinker): void

  invoke(uri: string, ...args: any[]): Promise<any>

  connectSignal(uri: string, slot: McoServiceSlot): McoServiceSlotHolder | undefined
  disconnectSignal(uri: string, slot: McoServiceSlot): void

  postEvent(event: string, ...args: any[]): void

  addEventListener(event: string, listener: McoEventListener): McoEventListenerHolder | undefined
  removeEventListener(event: string, listener: McoEventListener): void
}
