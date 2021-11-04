const webpack = require('webpack')
const chalk = require('chalk')
const fs = require('fs-extra')

const { initPaths, cachePaths } = require("../utils/paths")
const { getConfig } = require("../utils/project")

module.exports = async args => {
  const { src, dist, public } = args
  await initPaths({src, dist, public})

  const { webpackConfig: config } = await getConfig('production', args)

  webpack(config, (err, status) => {
    if (err) {
      console.error(err.stack || err)
      if (err.details) {
        console.error(err.details)
      }
      return
    }
    if (status.hasWarnings()) {
      console.log(chalk.yellow.bold('\n=== XH Compiled with warnings.===\n'))
      console.log(
        stats.toString({
          all: false,
          colors: true,
          warnings: true
        })
      )
    }
    if (status.hasErrors()) {
      console.log(
        status.toString({
          all: false,
          colors: true,
          errors: true
        })
      )
      console.log(chalk.red.bold('\n=== XH Failed to compile.===\n'))
      process.exit(1)
    }
    console.log(chalk.green.bold('\n=== XH Compiled successfully.===\n'))
    console.log(
      status.toString({
        colors: true,
        all: false,
        assets: true
      })
    )
    // 生成 serve 模式下需要文件
    fs.writeJson(cachePaths.buildConfig, { devServer: config.devServer }, err => {
      if (err) console.error(err)
    })
  })
}
