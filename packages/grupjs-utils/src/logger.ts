enum LogType {
  Log = 'Log',
  Debug = 'Debug',
  Warn = 'Warn',
  Error = 'Error',
}

const LogColor = {
  Log: 'green',
  Debug: 'yellow',
  Warn: 'fuchsia',
  Error: 'red',
}

function writeLog(type: LogType, filter: string, ...args: any[]) {
  console.log(`%c[${type}] [${filter}]`, `color: ${LogColor[type]}`, ...args)
}

const logger = {
  log(filter: string, ...args: any[]) {
    writeLog(LogType.Log, filter, args)
  },

  debug(filter: string, ...args: any[]) {
    writeLog(LogType.Debug, filter, args)
  },

  warn(filter: string, ...args: any[]) {
    writeLog(LogType.Warn, filter, args)
  },

  error(filter: string, ...args: any[]) {
    writeLog(LogType.Error, filter, args)
  },
}

export default logger
