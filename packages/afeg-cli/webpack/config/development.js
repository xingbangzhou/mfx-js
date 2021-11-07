module.exports = (env, config, args) => {
  const { devServer } = require('./devServer')(env, args)
  const devConfig = {
    mode: 'development',
    optimization: {
      usedExports: true
    },
    devtool: 'eval-cheap-module-source-map',
    devServer
  }

  config.merge(devConfig)
}
