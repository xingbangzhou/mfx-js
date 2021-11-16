const path = require('path')
const rootPath = path.resolve('./')

module.exports = ({env, config}) => {
  const devPort = 3001

  config.devServer.port(devPort)

  config.plugin('env').tap(args => {
    args[0] = {
      ...args[0],
      ...{
        HOST_ENV: '',
        NODE_DEBUG: '',
      },
    }
    return args
  })

  config.module
    .rule('worker')
    .test(/\.worker\.[j]s$/)
    .use('worker-loader')
    .loader('worker-loader')
    .tap(options => {
      options = {
        inline: 'no-fallback',
        filename: '[name].[contenthash].worker.js',
      }
      return options
    })
    .end()

  config.resolve.alias
    .set('zlib', 'browserify-zlib')
    .set('buffer', 'buffer')
    .set('assert', 'assert')
    .set('stream', 'stream-browserify')
    .set('@assets', path.resolve(rootPath, 'src', 'assets'))
}
