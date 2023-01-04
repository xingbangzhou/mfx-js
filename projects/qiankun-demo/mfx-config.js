const path = require('path')

const rootPath = path.resolve('./')
const {name} = require(path.join(rootPath, 'package.json'))

module.exports = ({wpChain, mode, options}) => {
  const devPort = 3001
  wpChain.devServer.port(devPort)

  wpChain.resolve.alias.set('@mfx0/base', path.resolve(__dirname, '../../packages/mfx-base/src'))
  wpChain.resolve.alias.set('@mfx0/sdk', path.resolve(__dirname, '../../packages/mfx-sdk/src'))
  wpChain.resolve.alias.set('@mfx0/material', path.resolve(__dirname, '../../packages/mfx-material/src'))
  wpChain.resolve.alias.set('@mfx0/utils', path.resolve(__dirname, '../../packages/mfx-utils/src'))

  wpChain.output.publicPath('/')
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
