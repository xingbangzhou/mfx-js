const path = require('path')

const rootPath = path.resolve('./')
const {name} = require(path.join(rootPath, 'package.json'))

module.exports = ({wpChain, mode, options}) => {
  const devPort = 3003
  wpChain.devServer.port(devPort)

  wpChain.resolve.alias.set('@mco/joy', path.resolve(__dirname, '../../packages/mco-joy/src'))
  wpChain.resolve.alias.set('@mco/utils', path.resolve(__dirname, '../../packages/mco-utils/src'))
  wpChain.resolve.alias.set('@mco/module', path.resolve(__dirname, '../../packages/mco-module/src'))

  wpChain.output.set('library', `${name}-[name]`)
  wpChain.output.set('libraryTarget', `umd`)
  wpChain.output.set('chunkLoadingGlobal', `webpackJsonp_${name}`)

  wpChain.plugin('html').tap(args => {
    args[0] = {
      ...args[0],
      ...{
        title: name,
      },
    }
    return args
  })
}
