const path = require('path')

const rootPath = path.resolve('./')
const {name} = require(path.join(rootPath, 'package.json'))

module.exports = ({chain, mode, options}) => {
  const devPort = 5002
  chain.devServer.port(devPort)

  chain.output.set('chunkFormat', 'array-push')

  chain.resolve.alias.set('@mfx0/base', path.resolve(__dirname, '../../packages/mfx-base/src'))
  chain.resolve.alias.set('@mfx0/framework', path.resolve(__dirname, '../../packages/mfx-framework/src'))
  chain.resolve.alias.set('@mfx0/material', path.resolve(__dirname, '../../packages/mfx-material/src'))
  chain.resolve.alias.set('@mfx0/utils', path.resolve(__dirname, '../../packages/mfx-utils/src'))

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
