import {webpack} from 'webpack'
import chalk from 'chalk'
import {wpChain} from '../webpack'

class BuildCli {
  async start() {
    const config = wpChain.toConfig()

    webpack(config, (err, status) => {
      if (err) {
        console.error(err.stack || err)
        return
      }
      if (status?.hasWarnings()) {
        console.log(chalk.yellow.bold('\n=== MFX Compiled with warnings.===\n'))
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
        console.log(chalk.red.bold('\n=== MFX Failed to compile.===\n'))
        process.exit(1)
      }
      console.log(chalk.green.bold('\n=== MFX Compiled successfully.===\n'))
      console.log(
        status?.toString({
          all: false,
          colors: true,
          assets: true,
        }),
      )
    })
  }
}

export default new BuildCli()
