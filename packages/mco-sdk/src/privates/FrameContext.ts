import ContextProxy from './ContextProxy'

export default class FrameContext extends ContextProxy {
  constructor() {
    super()

    window.addEventListener('message', this.onMessage, false)

    this.ready()
  }

  private static instance_?: FrameContext

  static instance() {
    if (!this.instance_) {
      FrameContext.instance_ = new FrameContext()
    }

    return FrameContext.instance_ as FrameContext
  }

  protected postMessage(cmd: string, ...args: any[]) {
    window.top?.postMessage({cmd, args}, '*')
  }

  private onMessage = (ev: MessageEvent<any>) => {
    const {source, data} = ev
    if (source !== window.top) return

    try {
      const cmd = data.cmd
      const args = data.args
      if (Array.isArray(args)) {
        this.onHandle(cmd, ...args)
      }
    } catch (error) {
      console.error('[FrameContext] onMessage, error: ', error)
    }
  }
}
