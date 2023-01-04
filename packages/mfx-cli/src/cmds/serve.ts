import express from 'express'
import compression from 'compression'
import cors from 'cors'
import {mfxEnv} from '../base'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import https from 'https'
import formatUrl from '../utils/formatUrl'

class ServeRunner {
  async start() {
    const app = express()
    app.use(compression())
    app.use(cors())

    const staticRoot = mfxEnv.dist || mfxEnv.resolve('dist')
    app.use(express.static(staticRoot))

    const html = await fs.readFile(path.join(staticRoot, 'index.html'), 'utf8')
    app.get('*', (req, res) => res.send(html))

    const devServer = mfxEnv.wpChain.toConfig().devServer as any

    const {host, port} = devServer
    const httpsOptions = devServer.https
    const publicPath = mfxEnv.public
    if (httpsOptions) {
      const httpsServer = https.createServer(httpsOptions, app)
      httpsServer.listen(port, () => {
        this.startLog({httpsOptions, host, port, publicPath})
      })
    } else {
      app.listen(port, () => {
        this.startLog({httpsOptions, host, port, publicPath})
      })
    }
  }

  private startLog({httpsOptions, host, port, publicPath}: any) {
    if (publicPath && (publicPath.indexOf('http://') > -1 || publicPath.indexOf('https://') > -1)) {
      console.log(`- Network: ${chalk.hex('#3498db')(publicPath)} \n`)
    } else {
      const protocol = httpsOptions ? 'https' : 'http'
      const realHost = host || '0.0.0.0'
      const urls = formatUrl(protocol, realHost, port)
      console.log(`- Local:   ${chalk.hex('#3498db')(urls.localUrlForTerminal)}`)
      console.log(`- Network: ${chalk.hex('#3498db')(urls.lanUrlForTerminal)} \n`)
    }
  }
}

export default new ServeRunner()
