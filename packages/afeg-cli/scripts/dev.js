const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

const { initPaths } = require("../utils/paths")
const { getConfig } = require("../utils/project")
const prepareURLs = require('../utils/prepareURLs')

module.exports = async args => {
  const { src, public, open } = args
  await initPaths({ src, public })

  const { webpackConfig: config } = await getConfig('development', args)

  const compiler = webpack(config)
  const server = new WebpackDevServer(config.devServer, compiler)

  const { https, host, port, publicPath } = config.devServer
  const protocol = https ? 'https' : 'http'
  const realHost = host || '0.0.0.0'
  const urls = prepareURLs(protocol, realHost, port, publicPath)

  server.start(config.devServer.port, realHost, err => {
    if (err) {
      console.error(err)
      return
    }
    compiler.hooks.done.tap('afeg-cli dev', status => {
      console.log()
      console.log()
      console.log(`  App running at:`)
      console.log(`  - Local:   ${chalk.cyan(urls.localUrlForTerminal)}`)
      console.log(`  - Network: ${chalk.cyan(urls.lanUrlForTerminal)}`)
      console.log()
    })
  })
}
