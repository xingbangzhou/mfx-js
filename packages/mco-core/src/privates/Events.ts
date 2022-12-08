import {EventEmitter} from '@mco/utils'
import {McoEventListener} from '../types'

export default class McoEvents {
  constructor() {}

  private emitter = new EventEmitter()

  postEvent(event: string, ...args: any[]) {
    this.emitter.emit(event, event, ...args)
  }

  addListener(event: string, listener: McoEventListener) {
    return this.emitter.on(event, listener)
  }

  removeListener(event: string, listener: McoEventListener) {
    this.emitter.off(event, listener)
  }
}
