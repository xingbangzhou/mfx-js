const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

const { setPaths, getPaths } = require("../utils/paths")
const { getProjectConfig } = require("../utils/project")

module.exports = async args => {
  const { src, public } = args
  await setPaths({ src, public })
  const paths = getPaths()
  const { webpackConfig: config } = await getProjectConfig('development', args, paths)

  const compiler = webpack(config)
  config.devServer = {allowedHosts: 'all', ...config.devServer}
  const server = new WebpackDevServer(config.devServer, compiler)

  server.start()
}
