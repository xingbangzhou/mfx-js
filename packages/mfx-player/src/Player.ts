import WorkerRender from './render/WorkerRender'
import {PlayOptions, PlayProps} from './types'

export default class MfxPlayer {
  constructor(container: HTMLElement, opts?: PlayOptions) {
    this._ctxRender = new WorkerRender(container, opts)
  }

  private _ctxRender: WorkerRender

  async load(props: PlayProps) {
    return this._ctxRender.load(props)
  }

  play() {
    this._ctxRender.play()
  }

  replay() {
    this._ctxRender.replay()
  }

  pause() {
    this._ctxRender.pause()
  }

  detroy() {
    this._ctxRender.destroy()
  }
}
