const path = require('path')

const rootPath = path.resolve('./')
const {name} = require(path.join(rootPath, 'package.json'))

module.exports = ({wpChain, mode, options}) => {
  const devPort = 5002
  wpChain.devServer.port(devPort)

  wpChain.resolve.alias.set('@mco/core', path.resolve(__dirname, '../../packages/mco-core/src'))
  wpChain.resolve.alias.set('@mco/joy', path.resolve(__dirname, '../../packages/mco-joy/src'))
  wpChain.resolve.alias.set('@mco/utils', path.resolve(__dirname, '../../packages/mco-utils/src'))

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
