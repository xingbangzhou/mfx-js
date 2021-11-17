const webpack = require('webpack')
const chalk = require('chalk')
const fs = require('fs-extra')

const { setPaths, getCachePaths, getPaths } = require("../utils/paths")
const { getProjectConfig } = require("../utils/project")

module.exports = async args => {
  const { src, dist, public } = args
  await setPaths({src, dist, public})
  const paths = getPaths()
  const { webpackConfig: config } = await getProjectConfig('production', args, paths)

  webpack(config, (err, status) => {
    if (err) {
      console.error(err.stack || err)
      if (err.details) {
        console.error(err.details)
      }
      return
    }
    if (status.hasWarnings()) {
      console.log(chalk.yellow.bold('\n=== GRUP Compiled with warnings.===\n'))
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
      console.log(chalk.red.bold('\n=== GRUP Failed to compile.===\n'))
      process.exit(1)
    }
    console.log(chalk.green.bold('\n=== GRUP Compiled successfully.===\n'))
    console.log(
      status.toString({
        colors: true,
        all: false,
        assets: true,
        timings: true,
        version: true
      }) + '\n'
    )
    // 生成 serve 模式下需要文件
    const cachePaths = getCachePaths()
    fs.writeJson(cachePaths.buildConfig, { devServer: config.devServer }, err => {
      if (err) console.error(err)
    })
  })
}
