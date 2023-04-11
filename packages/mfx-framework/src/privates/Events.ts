import {MxEventListener} from '@mfx0/core/types'
import EventEmitter from '@mfx0/core/EventEmitter'

export default class MxEvents {
  constructor() {}

  private _emitter = new EventEmitter()

  postEvent(event: string, ...args: any[]) {
    this._emitter.emit(event, ...args, event)
  }

  addListener(event: string, listener: MxEventListener) {
    return this._emitter.on(event, listener)
  }

  removeListener(event: string, listener: MxEventListener) {
    this._emitter.off(event, listener)
  }
}
