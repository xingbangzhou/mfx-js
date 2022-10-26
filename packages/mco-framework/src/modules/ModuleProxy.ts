import McoFrameworkContext from '../privates/FrameworkContext'
import McoModule from '../Module'
import McoModuleCleaner from '../privates/ModuleCleaner'

enum BCommand {
  Ready = 'rpc.ready',
  ConnectService = 'rpc.connnect_service',
  DisconnectService = 'rpc.disconnect_service',
  ConnectSignal = 'rpc.connect_signal',
  DisconnectSignal = 'rpc.disconnect_signal',
  InvokeMethod = 'rsp.invoke_method',
}

enum FCommand {
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
      case BCommand.Ready:
        this.fwReady()
        break
      case BCommand.ConnectService:
        this.ctx.connectService(args[0], this.onServiceConnection)
        break
      case BCommand.DisconnectService:
        this.ctx.disconnectService(args[0], this.onServiceConnection)
        break
      case BCommand.InvokeMethod:
        {
          const [mode, id, uri, ...params] = args
          this.handleInvokeMethod(mode, id, uri, ...params)
        }
        break
      case BCommand.ConnectSignal:
        this.ctx.connectSignal(args[0], this.onSignalSlot)
        break
      case BCommand.DisconnectSignal:
        this.ctx.disconnectSignal(args[0], this.onSignalSlot)
        break
      default:
        break
    }
  }

  protected fwReady() {
    this.postMessage(FCommand.FwReady)
  }

  protected abstract postMessage(cmd: string, ...args: any[]): void

  private async handleInvokeMethod(mode: string, id: string, uri: string, ...args: any[]) {
    if (mode === 'service') {
      const result = await this.ctx.invokeService(uri, ...args)
      this.postMessage(FCommand.InvokeResult, id, result)
    } else if (mode === 'member') {
      const result = await (this as any)[uri]?.(...args)
      this.postMessage(FCommand.InvokeResult, id, result)
    }
  }

  private onServiceConnection = (on: boolean, sId: string) => {
    this.postMessage(FCommand.ServiceConnection, on, sId)
  }

  private onSignalSlot = (uri: string, ...args: any[]) => {
    this.postMessage(FCommand.SignalSlot, uri, ...args)
  }
}
