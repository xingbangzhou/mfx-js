const path = require('path')

const rootPath = path.resolve('./')
const {name} = require(path.join(rootPath, 'package.json'))

module.exports = ({wpChain, mode, options}) => {
  const devPort = 5002
  wpChain.devServer.port(devPort)

  wpChain.resolve.alias.set('@mfx0/base', path.resolve(__dirname, '../../packages/mfx-base/src'))
  wpChain.resolve.alias.set('@mfx0/framework', path.resolve(__dirname, '../../packages/mfx-framework/src'))
  wpChain.resolve.alias.set('@mfx0/material', path.resolve(__dirname, '../../packages/mfx-material/src'))
  wpChain.resolve.alias.set('@mfx0/utils', path.resolve(__dirname, '../../packages/mfx-utils/src'))

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
