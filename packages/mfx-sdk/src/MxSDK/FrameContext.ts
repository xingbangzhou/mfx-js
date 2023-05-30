import MxExContext from './ExContext'

export default class MxFrameContext extends MxExContext {
  constructor() {
    super()

    window.addEventListener('message', this.onMessage, false)

    this.imReady()
  }

  private static instance_?: MxFrameContext

  static instance() {
    if (!this.instance_) {
      MxFrameContext.instance_ = new MxFrameContext()
    }

    return MxFrameContext.instance_ as MxFrameContext
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
      console.error('MxFrameContext', 'onMessage, error: ', error)
    }
  }
}
