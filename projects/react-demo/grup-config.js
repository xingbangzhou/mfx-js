const path = require('path')
const rootPath = path.resolve('./')
const packagePath = path.join(rootPath, 'package.json')
const {name} = require(packagePath)

module.exports = ({env, config}) => {
  const devPort = 5002

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

  //屏蔽 图片base 64
  config.module
    .rule('image')
    .test(/\.(a?png|jpe?g|gif|webp|bmp|avif)$/i)
    .type('asset/resource')

  config.module
    .rule('worker')
    .test(/\.worker\.js$/)
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

  config.plugin('html').tap(args => {
    args[0] = {
      ...args[0],
      ...{
        title: name
      },
    }
    return args
  })
}
