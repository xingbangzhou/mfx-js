export default class Logger {
  log(filter: string, ...args: any[]) {
    console.log(`%c[${filter}]`, `color: green`, ...args)
  }

  debug(filter: string, ...args: any[]) {
    console.debug(`%c[${filter}]`, `color: yellow`, ...args)
  }

  warn(filter: string, ...args: any[]) {
    console.warn(`%c[${filter}]`, `color: fuchsia`, ...args)
  }

  error(filter: string, ...args: any[]) {
    console.error(`[${filter}]`, ...args)
  }
}
