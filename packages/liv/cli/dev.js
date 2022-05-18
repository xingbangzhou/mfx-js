const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const openBrowser = require('react-dev-utils/openBrowser')
const { loadWPConfig } = require('../webpack')

module.exports = async options => {
  const { open } = options
  const config = await loadWPConfig('development', options)

  const compiler = webpack(config)
  const server = new WebpackDevServer(config.devServer, compiler)
  const host = config.devServer.host || 'localhost'
  // config.devServer.port, host,
  server.startCallback(() => {
    // if (open === true) {
    //   let url = host
    //   if (config.devServer.port != 80) url += ':' + config.devServer.port
    //   const protocol = config.devServer.https ? 'https' : 'http'
    //   openBrowser(`${protocol}://${url}`)
    //   console.log(`Starting server on ${protocol}://${host}:${config.devServer.port}`)
    // }
  })
}
