export enum LogType {
  Log,
  Warn,
  Error,
}

export interface LogProxy {
  (type: LogType, header: {name: string; rel?: string}, ...args: any[]): void
}

export default class Logger {
  constructor(proxy?: LogProxy, rel?: string) {
    this._proxy = proxy
    this._rel = rel
  }

  private _proxy?: LogProxy
  private _rel?: string

  log(name: string, ...args: any[]) {
    console.log(`%c[Log][${name}]%c[${this.timeStr()}]${this._rel || ''}`, `color: #c678dd`, `color: gray`, ...args)

    this._proxy?.(LogType.Log, {name, rel: this._rel}, ...args)
  }

  warn(name: string, ...args: any[]) {
    console.warn(`%c[Warn][${name}]%c[${this.timeStr()}]${this._rel || ''}`, `color: #953800`, `color: gray`, ...args)

    this._proxy?.(LogType.Warn, {name, rel: this._rel}, ...args)
  }

  error(name: string, ...args: any[]) {
    console.error(`%c[Error][${name}]%c[${this.timeStr()}]${this._rel || ''}`, `color: red`, `color: gray`, ...args)

    this._proxy?.(LogType.Error, {name, rel: this._rel}, ...args)
  }

  private timeStr() {
    const dt = new Date()
    return `${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}.${dt.getMilliseconds()}`
  }
}
