const path = require('path')

const rootPath = path.resolve('./')
const {name} = require(path.join(rootPath, 'package.json'))

module.exports = ({wpChain, mode, options}) => {
  const devPort = 3001
  wpChain.devServer.port(devPort)

  wpChain.resolve.alias.set('@mscx/module', path.resolve(__dirname, '../../packages/mscx-module/src'))
  wpChain.resolve.alias.set('@mscx/material', path.resolve(__dirname, '../../packages/mscx-material/src'))
  wpChain.resolve.alias.set('@mscx/utils', path.resolve(__dirname, '../../packages/mscx-utils/src'))

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
