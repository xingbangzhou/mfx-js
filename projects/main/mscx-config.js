const path = require('path')

const rootPath = path.resolve('./')
const {name} = require(path.join(rootPath, 'package.json'))

module.exports = ({wpChain, mode, options}) => {
  const devPort = 5002
  wpChain.devServer.port(devPort)

  wpChain.resolve.alias.set('@mscx/framework', path.resolve(__dirname, '../../packages/mscx-framework/src'))
  wpChain.resolve.alias.set('@mscx/material', path.resolve(__dirname, '../../packages/mscx-material/src'))
  wpChain.resolve.alias.set('@mscx/utils', path.resolve(__dirname, '../../packages/mscx-utils/src'))

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
