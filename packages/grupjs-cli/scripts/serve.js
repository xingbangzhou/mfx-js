const fs = require('fs-extra')
const express = require('express')
const cors = require('cors')
const compression = require('compression')
const https = require('https')
const path = require('path')
const chalk = require('chalk')

const prepareURLs = require('../utils/prepareURLs')
const {resolveApp, getCachePaths} = require('../utils/paths')
const cachePaths = getCachePaths()
let config = require('../webpack/config/devServer')('production', {hot: false, open: false, progress: false})

if (fs.existsSync(cachePaths.buildConfig)) {
  const buildConfig = require(cachePaths.buildConfig)
  config = {...config, ...buildConfig}
}
express.static.mime.types['ts'] = 'application/javascript'

const application = express()
application.use(compression())
application.use(cors())

module.exports = async args => {
  const {dist} = args
  const staticRoot = resolveApp(dist || 'dist')
  const isHTTPS = !!config.devServer.https
  const protocol = isHTTPS ? 'https' : 'http'
  const html = await fs.readFile(path.join(staticRoot, 'index.html'), 'utf8')

  application.use(express.static(staticRoot))
  application.get('*', (req, res) => res.send(html))

  if (isHTTPS && config.devServer.https.key && config.devServer.https.cert) {
    const httpsServer = https.createServer({key: config.devServer.https.key, cert: config.devServer.https.cert}, application)
    httpsServer.listen(config.devServer.port, () =>
      console.log(
        `GRUP APP listening at ${protocol}://${config.devServer.host || 'localhost'}:${config.devServer.port}`
      )
    )
  } else {
    application.listen(config.devServer.port, () => {
      const {https, host, port, publicPath} = config.devServer
      const protocol = https ? 'https' : 'http'
      const realHost = host || '0.0.0.0'
      const urls = prepareURLs(protocol, realHost, port, publicPath)
      console.info(`- Local:   ${chalk.hex('#3498db')(urls.localUrlForTerminal)}`)
      console.info(`- Network: ${chalk.hex('#3498db')(urls.lanUrlForTerminal)} \n`)
    })
  }
}
