const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const openBrowser = require('react-dev-utils/openBrowser')
const { loadWPConfig } = require('.')

module.exports = async options => {
  const { webpackConfig: wpConfig } = await loadWPConfig('development', options)

  const compiler = webpack(wpConfig)
  const server = new WebpackDevServer(wpConfig.devServer, compiler)
  const host = wpConfig.devServer.host || 'localhost'
  server.listen(wpConfig.devServer.port, host, err => {
    if (err) {
      console.error(err)
      return
    }
    if (open === true) {
      let url = host
      if (wpConfig.devServer.port != 80) url += ':' + wpConfig.devServer.port
      const protocol = wpConfig.devServer.https ? 'https' : 'http'
      openBrowser(`${protocol}://${url}`)
      console.log(`Starting server on ${protocol}://${host}:${wpConfig.devServer.port}`)
    }
  })
}
