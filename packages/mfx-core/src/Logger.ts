export enum LogType {
  Log,
  Warn,
  Error,
}

export interface LogHandler {
  (type: LogType, name: string, tag?: string, ...args: any[]): void
}

export default class Logger {
  constructor(tag?: string) {
    this._tag = tag
  }

  private _tag?: string
  private _handler?: LogHandler
  private _debug = false

  set handler(value: LogHandler | undefined) {
    this._handler = value
  }

  get handler() {
    return this._handler
  }

  set debug(value: boolean) {
    this._debug = value
  }

  get debug() {
    return this._debug
  }

  log(name: string, ...args: any[]) {
    this._debug &&
      console.log(`%c[Log][${name}]%c[${this.timeStr()}]${this._tag || ''}`, `color: #c678dd`, `color: gray`, ...args)

    this._handler?.(LogType.Log, name, this._tag, ...args)
  }

  warn(name: string, ...args: any[]) {
    this._debug &&
      console.warn(`%c[Warn][${name}]%c[${this.timeStr()}]${this._tag || ''}`, `color: #953800`, `color: gray`, ...args)

    this._handler?.(LogType.Warn, name, this._tag, ...args)
  }

  error(name: string, ...args: any[]) {
    this._debug &&
      console.error(`%c[Error][${name}]%c[${this.timeStr()}]${this._tag || ''}`, `color: red`, `color: gray`, ...args)

    this._handler?.(LogType.Error, name, this._tag, ...args)
  }

  private timeStr() {
    const dt = new Date()
    return `${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}.${dt.getMilliseconds()}`
  }
}
