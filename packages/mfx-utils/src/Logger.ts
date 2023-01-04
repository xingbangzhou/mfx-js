export default class Logger {
  constructor(name: string, rel?: string) {
    this.name = name
    this.rel = rel
  }

  private name: string
  private rel?: string

  log(...args: any[]) {
    console.log(`%c[Log][${this.name}]%c[${this.timeStr()}]${this.rel || ''}`, `color: #c678dd`, `color: gray`, ...args)
  }

  warn(...args: any[]) {
    console.warn(
      `%c[Warn][${this.name}]%c[${this.timeStr()}]${this.rel || ''}`,
      `color: #953800`,
      `color: gray`,
      ...args,
    )
  }

  error(...args: any[]) {
    console.error(`%c[Error][${this.name}]%c[${this.timeStr()}]${this.rel || ''}`, `color: red`, `color: gray`, ...args)
  }

  private timeStr() {
    const dt = new Date()
    return `${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}.${dt.getMilliseconds()}`
  }
}
