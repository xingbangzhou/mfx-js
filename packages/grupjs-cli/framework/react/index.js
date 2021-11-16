const {resolveApp} = require('../../utils/paths')
const packageJson = require(resolveApp('package.json')) || {}
packageJson.dependencies = packageJson.dependencies || {}
packageJson.devDependencies = packageJson.devDependencies || {}
const reactVersion = packageJson.dependencies.react || packageJson.devDependencies.react

const versionCompare = (preVersion = '', lastVersion = '') => {
  var sources = preVersion.replace('^', '').split('.')
  var dests = lastVersion.replace('^', '').split('.')
  var maxL = Math.max(sources.length, dests.length)
  var result = 0
  for (let i = 0; i < maxL; i++) {
    let preValue = sources.length > i ? sources[i] : 0
    let preNum = isNaN(Number(preValue)) ? preValue.charCodeAt() : Number(preValue)
    let lastValue = dests.length > i ? dests[i] : 0
    let lastNum = isNaN(Number(lastValue)) ? lastValue.charCodeAt() : Number(lastValue)
    if (preNum < lastNum) {
      result = -1
      break
    } else if (preNum > lastNum) {
      result = 1
      break
    }
  }
  return result
}

const isReact17 = versionCompare(reactVersion, '17')
const reactNewJsx = isReact17 ? {runtime: 'automatic'} : {}

module.exports = fn => op => {
  const {config, env, hot} = op
  const isDev = env === 'development'
  config.module
    .rule('scripts')
    .use('babel')
    .tap(o => {
      // react
      reactVersion && o.presets.push([require.resolve('@babel/preset-react'), reactNewJsx])
      // fast refresh
      isDev && hot && o.plugins.unshift(require.resolve('react-refresh/babel'))
      return o
    })

  config.module
    .rule('svg')
    .use('svgr')
    .before('url')
    .loader(require.resolve('@svgr/webpack'))
    .options({babel: false})
    .end()
    .use('babel')
    .before('svgr')
    .loader(require.resolve('babel-loader'))
    .options({
      presets: [
        require.resolve('@babel/preset-env'),
        require.resolve('@babel/preset-typescript'),
        [require.resolve('@babel/preset-react'), reactNewJsx],
      ],
    })
  if (hot && isDev) {
    config.plugin('reacthotloader').use(require('@pmmmwh/react-refresh-webpack-plugin'))
  }

  return fn && fn(op)
}
