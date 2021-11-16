module.exports = (env, config, args) => {
  const { devServer } = require('./devServer')(env, args)
  const development = {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer
  }

  config.merge(development)
}
