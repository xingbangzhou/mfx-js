import {mcoEnv} from 'src/base'
import {webpack} from 'webpack'
import WebpackDevServer from 'webpack-dev-server'

class DevRunner {
  async start() {
    const {wpChain} = mcoEnv
    const config = wpChain.toConfig()

    const compiler = webpack(config)
    const server = new WebpackDevServer(config.devServer, compiler)
    server.start()
  }
}

export default new DevRunner()
