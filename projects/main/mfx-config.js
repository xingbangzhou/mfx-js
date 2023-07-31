const path = require('path')

const rootPath = path.resolve('./')
const {name} = require(path.join(rootPath, 'package.json'))

module.exports = ({mode, env, progress, analyze}) => ({
  devServer: {
    port: 5002,
  },

  alias: {
    '@mfx-js/core': path.resolve(rootPath, '../../packages/mfx-core/src'),
    '@mfx-js/core/*': path.resolve(rootPath, '../../packages/mfx-core/src/*'),
    '@mfx-js/framework': path.resolve(rootPath, '../../packages/mfx-framework/src'),
    '@mfx-js/gui': path.resolve(rootPath, '../../packages/mfx-gui/src'),
  },

  chainExtender: wpChain => {
    wpChain.plugin('html').tap(args => {
      args[0] = {
        ...args[0],
        ...{
          title: name,
        },
      }
      return args
    })
  },
})
