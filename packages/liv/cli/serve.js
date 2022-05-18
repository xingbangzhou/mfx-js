const fs = require('fs-extra')
const https = require('https')
const path = require('path')
const express = require('express')
const compression = require('compression')
const {resolveApp, getCacheFiles} = require('../webpack/configure')

let config = {}
config = require('../webpack/devServer')(false, true)
const cacheFiles = getCacheFiles()
if (fs.existsSync(cacheFiles.buildConfig)) {
  const buildConfig = require(cacheFiles.buildConfig)
  config = {...config, ...buildConfig}
}
express.static.mime.types['ts'] = 'application/javascript'
//
const app = express()
app.use(compression())

module.exports = async () => {
  const staticRoot = resolveApp('dist')
  const isHTTPS = !!config.devServer.https
  const protocol = isHTTPS ? 'https' : 'http'
  const html = await fs.readFile(path.join(staticRoot, 'index.html'), 'utf8')

  app.use(express.static(staticRoot))
  app.get('*', (_req, rsp) => rsp.send(html))
  //
  if (isHTTPS && config.devServer.https.key && config.devServer.https.cert) {
    const httpsServer = https.createServer({key: config.devServer.https.key, cert: config.devServer.https.cert}, app)
    httpsServer.listen(config.devServer.port, () =>
      console.log(
        `LIV APP listening at ${protocol}://${config.devServer.host || 'localhost'}:${config.devServer.port}`,
      ),
    )
  } else {
    app.listen(config.devServer.port, () =>
      console.log(
        `LIV APP listening at ${protocol}://${config.devServer.host || 'localhost'}:${config.devServer.port}`,
      ),
    )
  }
}
