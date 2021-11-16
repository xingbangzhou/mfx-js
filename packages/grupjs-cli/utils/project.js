const Configs = require('webpack-chain')
const config = new Configs()
const runtime = require('./runtime')

module.exports = {
  async getProjectConfig(env, args = {}, paths) {
    await runtime.setup(args, config, env, paths)
    require('../webpack/config/common')()
    require(`../webpack/config/${env}`)(env, config, args)

    const result = await runtime.run()
    return result
  }
}
