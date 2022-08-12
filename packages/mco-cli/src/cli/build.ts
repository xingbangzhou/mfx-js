import {mcoBase} from 'src/base'
import {webpack} from 'webpack'
import chalk from 'chalk'
import fs from 'fs-extra'

class BuildRunner {
  async start() {
    const {wpChain, cacheFiles} = mcoBase
    const config = wpChain.toConfig()

    webpack(config, (err, status) => {
      if (err) {
        console.error(err.stack || err)
        return
      }
      if (status?.hasWarnings()) {
        console.log(chalk.yellow.bold('\n=== LIV Compiled with warnings.===\n'))
        console.log(
          status.toString({
            all: false,
            colors: true,
            warnings: true,
          }),
        )
      }
      if (status?.hasErrors()) {
        console.log(
          status.toString({
            all: false,
            colors: true,
            errors: true,
          }),
        )
        console.log(chalk.red.bold('\n=== LIV Failed to compile.===\n'))
        process.exit(1)
      }
      console.log(chalk.green.bold('\n=== LIV Compiled successfully.===\n'))
      console.log(
        status?.toString({
          colors: true,
          all: false,
          assets: true,
        }),
      )

      // 生成 serve 模式下需要文件
      fs.writeJson(cacheFiles.buildConfig, {devServer: config.devServer}, err => {
        console.error(err)
      })
    })
  }
}

export default new BuildRunner()
