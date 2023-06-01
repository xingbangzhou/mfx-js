const path = require('path')

const rootPath = path.resolve('./')
const {name} = require(path.join(rootPath, 'package.json'))

module.exports = ({chain, mode, options}) => {
  const devPort = 5002
  chain.devServer.port(devPort)

  chain.output.set('chunkFormat', 'array-push')

  chain.resolve.alias.set('@mfx-js/core', path.resolve(rootPath, '../../packages/mfx-core/src'))
  chain.resolve.alias.set('@mfx-js/core/*', path.resolve(rootPath, '../../packages/mfx-core/src/*'))
  chain.resolve.alias.set('@mfx-js/framework', path.resolve(rootPath, '../../packages/mfx-framework/src'))
  chain.resolve.alias.set('@mfx-js/gui', path.resolve(rootPath, '../../packages/mfx-gui/src'))

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
