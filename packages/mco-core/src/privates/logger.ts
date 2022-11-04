class McoLogger {
  constructor() {}

  log(name: string, ...args: any[]) {
    console.log(`%c[${name}]%c[${this.timeStr()}]`, `color: #c678dd`, `color: gray`, ...args)
  }

  warn(name: string, ...args: any[]) {
    console.warn(`%c[${name}]%c[${this.timeStr()}]`, `color: #953800`, `color: gray`, ...args)
  }

  error(name: string, ...args: any[]) {
    console.error(`%c[${name}]%c[${this.timeStr()}]`, `color: red`, `color: gray`, ...args)
  }

  private timeStr() {
    const dt = new Date()
    return `${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}.${dt.getMilliseconds()}`
  }
}

const logger = new McoLogger()

export default logger
