const {configure} = require('./configure')

const setup = function () {
  const { wpConfig, options, public } = configure
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
