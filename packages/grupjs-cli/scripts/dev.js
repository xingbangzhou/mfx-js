const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const { setPaths, getPaths } = require("../utils/paths")
const { getProjectConfig } = require("../utils/project")
const prepareURLs = require('../utils/prepareURLs')

module.exports = async args => {
  const { src, public } = args
  await setPaths({ src, public })
  const paths = getPaths()
  const { webpackConfig: config } = await getProjectConfig('development', args, paths)

  const compiler = webpack(config)
  config.devServer = {allowedHosts: 'all', ...config.devServer}
  const server = new WebpackDevServer(config.devServer, compiler)
  const {https, host, port, publicPath} = config.devServer
  const protocol = https ? 'https' : 'http'
  const realHost = host || '0.0.0.0'
  const urls = prepareURLs(protocol, realHost, port, publicPath)

  server.start(port, realHost, error => {
    console.log("server.start")
    if (error) {
      console.error(error)
      return
    }
    compiler.hooks.done.tap('grup dev', stats => {
      console.info(`\n  App running at:`)
      console.info(`  - Local:   ${chalk.cyan(urls.localUrlForTerminal)}`)
      console.info(`  - Network: ${chalk.cyan(urls.lanUrlForTerminal)} \n`)
    })
  })
}
