import {MfxEventListener} from '@mfx-js/core/types'
import EventEmitter from '@mfx-js/core/EventEmitter'

export default class MfxEvents {
  constructor() {}

  private _emitter = new EventEmitter()

  postEvent(event: string, ...args: any[]) {
    this._emitter.emit(event, ...args, event)
  }

  addListener(event: string, listener: MfxEventListener) {
    return this._emitter.on(event, listener)
  }

  removeListener(event: string, listener: MfxEventListener) {
    this._emitter.off(event, listener)
  }
}
