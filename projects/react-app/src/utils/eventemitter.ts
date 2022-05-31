export interface ListenerFn {
  (...args: any[]): void
}
class EE {
  fn: ListenerFn
  context?: any
  once?: boolean
  constructor(fn: ListenerFn, context?: any, once?: boolean) {
    this.fn = fn
    this.context = context
    this.once = once
  }
}

export class ListenerHolder {
  emitter?: EventEmitter
  type?: string
  listener?: EE

  constructor(emitter: EventEmitter, type: string, listener: EE) {
    this.emitter = emitter
    this.type = type
    this.listener = listener
  }

  off() {
    this.emitter &&
      this.type &&
      this.listener &&
      this.emitter.off(this.type, this.listener.fn, this.listener.context, this.listener.once)
    this.emitter = undefined
    this.type = undefined
    this.listener = undefined
  }
}

export class EventEmitter {
  private _events: Record<string, EE | EE[]> = {}
  private _eventCount = 0

  emit(type: string, ...args: any[]) {
    const listeners = this._events[type]
    if (!listeners) return false

    if (!Array.isArray(listeners)) {
      if (listeners.once) {
        this.off(type, listeners.fn, undefined, true)
      }
      listeners.fn.apply(listeners.context, args)
    } else {
      const length = listeners.length
      for (let i = 0; i < length; i++) {
        if (listeners[i].once) {
          this.off(type, listeners[i].fn, undefined, true)
        }
        listeners[i].fn.apply(listeners[i].context, args)
      }
    }

    return true
  }

  on(type: string, fn: ListenerFn, context?: any, prepend = false): ListenerHolder {
    const listener = this.addListener(type, fn, context, false, prepend)

    const holder = new ListenerHolder(this, type, listener)
    return holder
  }

  once(type: string, fn: ListenerFn, context?: any): ListenerHolder {
    const listener = this.addListener(type, fn, context, true)

    const holder = new ListenerHolder(this, type, listener)
    return holder
  }

  off = EventEmitter.prototype.removeListener

  eventNames() {
    const names: string[] = []
    if (this._eventCount === 0) return names
    for (const name in this._events) {
      if (Object.prototype.hasOwnProperty.call(this._events, name)) names.push(name)
    }
    return names
  }

  clearFns(fn: ListenerFn, context?: any, once?: boolean) {
    const names = this.eventNames()
    for (let i = 0, length = names.length; i < length; i++) {
      this.removeListener(names[i], fn, context, once)
    }
  }

  private addListener(type: string, fn: ListenerFn, context?: any, once?: boolean, prepend = false) {
    const listener = new EE(fn, context || this, once)
    const event = this._events[type]
    if (!event) {
      this._events[type] = listener
      this._eventCount++
    } else if (Array.isArray(event)) {
      prepend ? event.unshift(listener) : event.push(listener)
    } else {
      this._events[type] = prepend ? [listener, event] : [event, listener]
    }
    return listener
  }

  private removeListener(type: string, fn: ListenerFn, context?: any, once?: boolean) {
    const listeners = this._events[type]
    if (!listeners) return

    if (Array.isArray(listeners)) {
      const accus: EE[] = []
      for (let i = 0, length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || (once && !listeners[i].once) || (context && listeners[i].context !== context)) {
          accus.push(listeners[i])
        }
      }
      if (accus.length) this._events[type] = accus.length === 1 ? accus[0] : accus
      else this.clearEvent(type)
    } else {
      if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
        this.clearEvent(type)
      }
    }
  }

  private clearEvent(type: string) {
    if (--this._eventCount === 0) this._events = {}
    else delete this._events[type]
  }
}
