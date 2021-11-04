const child_process = require('child_process')

module.exports = {
  cmdSync(cmd, throwError = false) {
    try {
      return child_process.execSync(cmd).toString()
    } catch (error) {
      if (throwError) console.error(error)
    }
  }
}
