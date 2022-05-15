const { wpEnv } = require('./wpEnv')

const setup = function () {
  const { wpConfig, options, public } = wpEnv
  const { hot } = options

  wpConfig.merge({
    mode: 'development',
    optimization: {
      usedExports: true,
    },
    devtool: 'eval'
  })

  const devServer = require('./devServer')(hot, public)
  wpConfig.merge(devServer)
}

module.exports = {
  setup
}
