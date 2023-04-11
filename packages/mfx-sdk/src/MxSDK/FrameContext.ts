import YoExContext from './ExContext'

export default class YoFrameContext extends YoExContext {
  constructor() {
    super()

    window.addEventListener('message', this.onMessage, false)

    this.imReady()
  }

  private static instance_?: YoFrameContext

  static instance() {
    if (!this.instance_) {
      YoFrameContext.instance_ = new YoFrameContext()
    }

    return YoFrameContext.instance_ as YoFrameContext
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
        this.onCommand(cmd, ...args)
      }
    } catch (error) {
      console.error('YoFrameContext', 'onMessage, error: ', error)
    }
  }
}
