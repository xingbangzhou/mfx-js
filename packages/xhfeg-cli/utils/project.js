const fs = require('fs-extra')
const Config = require('webpack-chain')
const { checkRemote } = require('./paths')
const config = new Config()
const runtimeCompile = require('./runtime')

module.exports = {
  async getConfig(env, args = {}) {
    const {
      xhConfigPath,
      xhPackageJsonPath
    } = await checkRemote()

    require('../webpack/config/common')(env, config, args, xhConfigPath)
    require(`../webpack/config/${env}`)(env, config, args)

    const result = await runtimeCompile.run(env, config, args, xhPackageJsonPath, xhConfigPath)
    return result
  }
}
