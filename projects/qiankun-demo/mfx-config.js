const path = require('path')

const rootPath = path.resolve('./')
const {name} = require(path.join(rootPath, 'package.json'))

module.exports = ({chain, mode, options}) => {
  const devPort = 3001
  chain.devServer.port(devPort)

  chain.output.set('chunkFormat', 'array-push')

  chain.resolve.alias.set('@mfx0/base', path.resolve(__dirname, '../../packages/mfx-base/src'))
  chain.resolve.alias.set('@mfx0/sdk', path.resolve(__dirname, '../../packages/mfx-sdk/src'))
  chain.resolve.alias.set('@mfx0/material', path.resolve(__dirname, '../../packages/mfx-material/src'))
  chain.resolve.alias.set('@mfx0/utils', path.resolve(__dirname, '../../packages/mfx-utils/src'))

  chain.output.publicPath('/')
  chain.output.set('library', `${name}-[name]`)
  chain.output.set('libraryTarget', `umd`)
  chain.output.set('chunkLoadingGlobal', `webpackJsonp_${name}`)

  chain.plugin('html').tap(args => {
    args[0] = {
      ...args[0],
      ...{
        title: name,
      },
    }
    return args
  })
}
