import {wpChain} from 'src/webpack'
import {webpack} from 'webpack'
import WebpackDevServer from 'webpack-dev-server'

class DevCli {
  async start() {
    const config = wpChain.toConfig()

    const compiler = webpack(config)
    const server = new WebpackDevServer(config.devServer, compiler)
    server.start()
  }
}

export default new DevCli()
