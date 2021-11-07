const fs = require('fs-extra')
const Config = require('webpack-chain')
const { checkRemote } = require('./paths')
const config = new Config()
const runtimeCompile = require('./runtime')

module.exports = {
  async getConfig(env, args = {}) {
    const {
      afegConfigPath,
      afegPackageJsonPath
    } = await checkRemote()

    require('../webpack/config/common')(env, config, args, afegConfigPath)
    require(`../webpack/config/${env}`)(env, config, args)

    const result = await runtimeCompile.run(env, config, args, afegPackageJsonPath, afegConfigPath)
    return result
  }
}
