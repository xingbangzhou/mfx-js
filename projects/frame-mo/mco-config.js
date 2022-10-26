const path = require('path')

const rootPath = path.resolve('./')
const {name} = require(path.join(rootPath, 'package.json'))

module.exports = ({wpChain, mode, options}) => {
  const devPort = 5003
  wpChain.devServer.port(devPort)

  wpChain.resolve.alias.set('@mco/ui', path.resolve(__dirname, '../../packages/mco-ui/src'))
  wpChain.resolve.alias.set('@mco/utils', path.resolve(__dirname, '../../packages/mco-utils/src'))
  wpChain.resolve.alias.set('@mco/binder', path.resolve(__dirname, '../../packages/mco-binder/src'))

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
