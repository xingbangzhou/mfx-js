import Service from '../Service'
import {
  McoModuleContextFuncs,
  McoServiceConnn,
  McoServiceConnnHolder,
  McoServiceSlot,
  McoServiceSlotHolder,
} from '../types'

enum RPCCommand {
  Ready = 'rpc.ready',
  ConnectService = 'rpc.connnect_service',
  DisconnectService = 'rpc.disconnect_service',
  InvokeFunc = 'rpc.invoke_func',
  ConnectSignal = 'rpc.connect_signal',
  DisconnectSignal = 'rpc.disconnect_signal',
}

enum RPCFeedback {
  FwReady = 'rpc.fwready',
  ServiceConnection = 'rpc.service_connection',
  InvokeResult = 'rpc.invoke_result',
  SignalSlot = 'rpc.signal_slot',
}

interface InvokeResolve {
  (result: any): void
}

interface InvokeReject {
  (error: any): void
}

let invokeTime = new Date().getTime()
let invokeIndex = 0
const INVOKETIMEMS = 2500

function invokeId() {
  const curTime = new Date().getTime()
  if (curTime !== invokeTime) {
    invokeTime = curTime
    invokeIndex = 0
  } else {
    invokeIndex++
  }
  return `${invokeTime}_${invokeIndex}`
}

export default abstract class RPCContext implements McoModuleContextFuncs {
  constructor() {}

  private fwReady = false
  private blockCmds?: [string, any[]][]
  private connns?: Record<string, McoServiceConnn[]>
  private slots?: Record<string, McoServiceSlot[]>
  private invokes?: Record<string, [number, InvokeResolve, InvokeReject]>
  private invokeIntervalId?: number

  registerService(_service: Service): void {
    console.error("[RPCContext]: don't realize registerService")
  }
  unregisterService(_service: Service): void {
    console.error("[RPCContext]: don't realize unregisterService")
  }

  connectService(sId: string, connn: McoServiceConnn): McoServiceConnnHolder {
    if (!this.connns) this.connns = {}
    const list = this.connns[sId] || []
    if (!list.includes(connn)) {
      list.push(connn)
    }
    this.connns[sId] = list

    this.command(RPCCommand.ConnectService, sId)

    return new McoServiceConnnHolder(this, sId, connn)
  }

  disconnectService(sId: string, connn: McoServiceConnn) {
    const list = this.connns?.[sId]
    if (!list) return
    const idx = list.indexOf(connn)
    if (idx && idx !== -1) {
      list.splice(idx, 1)
      if (!list.length) {
        delete this.connns?.[sId]
        this.command(RPCCommand.DisconnectService, sId)
      }
    }
  }

  async invokeFunc(uri: string, ...args: any[]) {
    const result = await new Promise((resolve, reject) => {
      if (!this.invokes) this.invokes = {}
      const id = invokeId()
      this.invokes[id] = [new Date().getTime(), resolve, reject]
      if (!this.invokeIntervalId) {
        this.invokeIntervalId = window.setInterval(this.onInvokeInterval, INVOKETIMEMS)
      }
      this.command(RPCCommand.InvokeFunc, id, uri, ...args)
    })

    return result
  }

  connectSignal(uri: string, slot: McoServiceSlot): McoServiceSlotHolder {
    if (!this.slots) this.slots = {}
    const list = this.slots[uri] || []
    if (!list.includes(slot)) {
      list.push(slot)
    }
    this.slots[uri] = list

    this.command(RPCCommand.ConnectSignal, uri)

    return new McoServiceSlotHolder(this, uri, slot)
  }

  disconnectSignal(uri: string, slot: McoServiceSlot) {
    const list = this.slots?.[uri]
    if (!list) return
    const idx = list?.indexOf(slot)
    if (idx && idx !== -1) {
      list.splice(idx, 1)
      if (!list.length) {
        delete this.slots?.[uri]
        this.command(RPCCommand.DisconnectSignal, uri)
      }
    }
  }

  protected abstract rpc(cmd: string, ...args: any[]): void

  protected imReady() {
    this.rpc(RPCCommand.Ready)
  }

  protected onHandle = (cmd: string, ...args: any[]) => {
    switch (cmd) {
      case RPCFeedback.FwReady:
        this.onFwReady()
        break
      case RPCFeedback.ServiceConnection:
        const [on, sId] = args
        this.onServiceConnection(on, sId)
        break
      case RPCFeedback.InvokeResult:
        const [id, result] = args
        this.onInvokeResult(id, result)
        break
      case RPCFeedback.SignalSlot:
        const [uri, ...params] = args
        this.onSignalSlot(uri, ...params)
        break
      default:
        break
    }
  }

  private command(cmd: string, ...args: any[]) {
    if (this.fwReady) {
      this.rpc(cmd, ...args)
      return
    }
    if (!this.blockCmds) this.blockCmds = [[cmd, args]]
    else this.blockCmds.push([cmd, args])
  }

  private onInvokeInterval = () => {
    const curTime = new Date().getTime()
    let count = 0
    for (const id in this.invokes) {
      count++
      const inv = this.invokes[id]
      if (curTime - inv[0] < INVOKETIMEMS) continue
      inv[2]('rpc invoke timeout!!!')
      delete this.invokes[id]
      count--
    }
    if (!count) {
      this.invokes = undefined
      window.clearInterval(this.invokeIntervalId)
      this.invokeIntervalId = undefined
    }
  }

  private onFwReady() {
    if (this.fwReady) return
    this.fwReady = true

    this.blockCmds?.forEach(([cmd, args]) => this.rpc(cmd, ...args))
    this.blockCmds = undefined
  }

  private onServiceConnection(on: boolean, sId: string) {
    const list = this.connns?.[sId]
    list?.forEach(el => el(on, sId))
  }

  private onInvokeResult(id: string, result: any) {
    const inv = this.invokes?.[id]
    if (inv) {
      inv[1](result)
      delete this.invokes?.[id]
    }
  }

  private onSignalSlot(uri: string, ...args: any[]) {
    const list = this.slots?.[uri]
    list?.forEach(el => el(uri, ...args))
  }
}
