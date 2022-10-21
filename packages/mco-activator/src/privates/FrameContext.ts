import RPCContext from './RPCContext'

export default class FrameContext extends RPCContext {
  constructor() {
    super()
    window.addEventListener('message', this.onMessage, false)
    this.imReady()
  }

  private static instance_?: FrameContext

  static instance() {
    if (!this.instance_) {
      FrameContext.instance_ = new FrameContext()
    }

    return FrameContext.instance_ as FrameContext
  }

  protected rpc(cmd: string, ...args: any[]) {
    window.top?.postMessage({cmd, args}, '*')
  }

  private onMessage = (ev: MessageEvent<any>) => {
    const {source, data} = ev
    if (source !== window.top) return

    let cmd: string | undefined = undefined
    let args: any[] = []
    try {
      cmd = data.cmd
      if (Array.isArray(data.args)) {
        args = data.args
      }
    } catch (error) {
      console.error('[FrameContext] onMessage, error: ', error)
    }

    cmd && this.onHandle(cmd, ...args)
  }
}
