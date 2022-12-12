import {EventEmitter} from '@mscx/utils'
import {MscxEventListener} from '../types'

export default class MscxEvents {
  constructor() {}

  private emitter = new EventEmitter()

  postEvent(event: string, ...args: any[]) {
    this.emitter.emit(event, event, ...args)
  }

  addListener(event: string, listener: MscxEventListener) {
    return this.emitter.on(event, listener)
  }

  removeListener(event: string, listener: MscxEventListener) {
    this.emitter.off(event, listener)
  }
}
