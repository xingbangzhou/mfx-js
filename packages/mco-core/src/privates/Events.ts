import {EventEmitter} from '@mco/utils'
import {McoEventListener} from '../types'
import logger from './logger'

export default class McoEvents {
  constructor() {}

  private emitter = new EventEmitter()

  postEvent(event: string, ...args: any[]) {
    this.emitter.emit(event, event, ...args)
  }

  addListener(event: string, listener: McoEventListener) {
    if (!event || typeof event !== 'string') {
      logger.error('McoServices.connect', 'Error: event invalid, ', event)
      return
    }

    return this.emitter.on(event, listener)
  }

  removeListener(event: string, listener: McoEventListener) {
    this.emitter.off(event, listener)
  }
}
