const webpack = require('webpack')
const fs = require('fs-extra')
const { withReact } = require('./react')

class RuntimeCompile {
  env = ''
  config = undefined
  args = {}
  xhPackageJsonPath = ''
  xhConfigPath
  remotePackageJson = {}

  async run(env, config, args, xhPackageJsonPath, xhConfigPath) {
    Object.assign(this, { env, config, args, xhPackageJsonPath, xhConfigPath })
    await this._defaultRuntime()
    const webpackConfig = config.toConfig()

    return { webpackConfig }
  }

  async _defaultRuntime() {
    this.remotePackageJson = this.xhPackageJsonPath ?
      await fs.readJSON(this.xhPackageJsonPath) : { dependencies: {}, devDependencies: {} }

    if (this.xhConfigPath) {
      await this._doWidthJsConfig()
    }
  }

  async _doWidthJsConfig() {
    await withReact(this.env, this.config, this.args)
    const withRemote = require(this.xhConfigPath)
    if (typeof withRemote === 'function') {
      withRemote(this.env, this.config, this.args)
    }
  }
}

module.exports = new RuntimeCompile()
