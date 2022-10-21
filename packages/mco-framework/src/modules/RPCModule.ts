import McoFrameworkContext from '../privates/FrameworkContext'
import McoModule from '../Module'
import McoModuleCleaner from 'src/privates/ModuleCleaner'

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

export default abstract class RPCModule extends McoModule {
  constructor(fwCtx: McoFrameworkContext, cleaner: McoModuleCleaner, mId: string) {
    super(fwCtx, cleaner, mId)
  }

  onHandle(cmd: string, ...args: any[]) {
    switch (cmd) {
      case RPCCommand.Ready:
        this.fwReady()
        break
      case RPCCommand.ConnectService:
        {
          const [sId] = args
          this.ctx.connectService(sId, this.onServiceConnection)
        }
        break
      case RPCCommand.DisconnectService:
        {
          const [sId] = args
          this.ctx.disconnectService(sId, this.onServiceConnection)
        }
        break
      case RPCCommand.InvokeFunc:
        {
          const [id, uri, ...params] = args
          this.onInvokeResult(id, uri, ...params)
        }
        break
      case RPCCommand.ConnectSignal:
        {
          const [uri] = args
          this.ctx.connectSignal(uri, this.onSignalSlot)
        }
        break
      case RPCCommand.DisconnectSignal:
        {
          const [uri] = args
          this.ctx.disconnectSignal(uri, this.onSignalSlot)
        }
        break
      default:
        break
    }
  }

  protected abstract rpc(cmd: string, ...args: any[]): void

  protected fwReady() {
    this.rpc(RPCFeedback.FwReady)
  }

  private onServiceConnection = (on: boolean, sId: string) => {
    this.rpc(RPCFeedback.ServiceConnection, on, sId)
  }

  private onInvokeResult(id: string, uri: string, ...args: any[]) {
    this.ctx.invokeFunc(uri, ...args).then(result => {
      this.rpc(RPCFeedback.InvokeResult, id, result)
    })
  }

  private onSignalSlot = (uri: string, ...args: any[]) => {
    this.rpc(RPCFeedback.SignalSlot, uri, ...args)
  }
}
