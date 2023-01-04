import {MfxEventListener} from '@mfx0/base'
import {EventEmitter} from '@mfx0/utils'

export default class MfxEvents {
  constructor() {}

  private emitter = new EventEmitter()

  postEvent(event: string, ...args: any[]) {
    this.emitter.emit(event, ...args, event)
  }

  addListener(event: string, listener: MfxEventListener) {
    return this.emitter.on(event, listener)
  }

  removeListener(event: string, listener: MfxEventListener) {
    this.emitter.off(event, listener)
  }
}
