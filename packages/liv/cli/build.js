const webpack = require('webpack')
const chalk = require('chalk')
const fs = require('fs-extra')
const {loadWPConfig} = require('../webpack')
const {getCacheFiles} = require('../webpack/configure')

function buildServeConfig(path, config) {
  fs.writeJson(path, config, err => {
    if (err) return console.error(err)
  })
}

module.exports = async options => {
  const config = await loadWPConfig('production', options)

  webpack(config, (err, status) => {
    if (err) {
      console.error(err.stack || err)
      if (err.details) {
        console.error(err.details)
      }
      return
    }
    if (status.hasWarnings()) {
      console.log(chalk.yellow.bold('\n=== LIV Compiled with warnings.===\n'))
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
      console.log(chalk.red.bold('\n=== LIV Failed to compile.===\n'))
      process.exit(1)
    }
    console.log(chalk.green.bold('\n=== LIV Compiled successfully.===\n'))
    console.log(
      status.toString({
        colors: true,
        all: false,
        assets: true
      })
    )

    // 生成 serve 模式下需要文件
    const cacheFiles = getCacheFiles()
    fs.writeJson(cacheFiles.buildConfig, { devServer: config.devServer }, err => {
      if (err) console.error(err)
    })
  })
}
