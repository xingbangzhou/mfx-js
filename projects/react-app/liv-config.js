const path = require('path')

const rootPath = path.resolve('./')
const { name } = require(path.join(rootPath, 'package.json'))

module.exports = (wpConfig, options, env) => {
  const devPort = 5002
  wpConfig.devServer.port(devPort)

  wpConfig.module
    .rule('worker')
    .test(/\.worker\.js$/)
    .use('worker-loader')
    .loader('worker-loader')
    .tap(options => {
      options = {
        inline: 'no-fallback',
        filename: '[name].[contenthash].worker.js'
      }
      return options
    })
    .end()

  wpConfig.resolve.alias
    .set('zlib', 'browserify-zlib')
    .set('buffer', 'buffer')
    .set('assert', 'assert')
    .set('stream', 'stream-browserify')

  wpConfig.plugin('html').tap(args => {
    args[0] = {
      ...args[0],
      ...{
        title: name
      }
    }
    return args
  })
}
