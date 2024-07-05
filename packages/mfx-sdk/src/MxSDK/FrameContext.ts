import MfxExContext from './ExContext'

export default class MfxFrameContext extends MfxExContext {
  constructor() {
    super()

    window.addEventListener('message', this.onMessage, false)

    this.imReady()
  }

  private static instance_?: MfxFrameContext

  static instance() {
    if (!this.instance_) {
      MfxFrameContext.instance_ = new MfxFrameContext()
    }

    return MfxFrameContext.instance_ as MfxFrameContext
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
      console.error('MfxFrameContext', 'onMessage, error: ', error)
    }
  }
}
