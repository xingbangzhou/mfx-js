const webpack = require('webpack')
const fs = require('fs-extra')
const { withReact } = require('./react')

class RuntimeCompile {
  env = ''
  config = undefined
  args = {}
  afegPackageJsonPath = ''
  afegConfigPath
  remotePackageJson = {}

  async run(env, config, args, afegPackageJsonPath, afegConfigPath) {
    Object.assign(this, { env, config, args, afegPackageJsonPath, afegConfigPath })
    await this._defaultRuntime()
    const webpackConfig = config.toConfig()

    return { webpackConfig }
  }

  async _defaultRuntime() {
    this.remotePackageJson = this.afegPackageJsonPath ?
      await fs.readJSON(this.afegPackageJsonPath) : { dependencies: {}, devDependencies: {} }

    if (this.afegConfigPath) {
      await this._doWidthJsConfig()
    }
  }

  async _doWidthJsConfig() {
    await withReact(this.env, this.config, this.args)
    const withRemote = require(this.afegConfigPath)
    if (typeof withRemote === 'function') {
      withRemote(this.env, this.config, this.args)
    }
  }
}

module.exports = new RuntimeCompile()
