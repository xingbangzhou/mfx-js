const { wpEnv } = require('./wpEnv')

const setup = () => {
  const { env, options, wpConfig } = wpEnv
  const { hot } = options
  const isDev = env === 'development'

  wpConfig.module
    .rule('scripts')
    .use('babel')
    .tap(o => {
      // react
      o.presets.push([
        require.resolve('@babel/preset-react'), {
          "runtime": "automatic"
        }
      ])
      // fast refresh
      isDev && hot && o.plugins.unshift(require.resolve('react-refresh/babel'))
      return o
    })

  wpConfig.module
    .rule('svg')
    .use('svgr')
    .before('url')
    .loader('@svgr/webpack')
    .options({babel: false})
    .end()
    .use('babel')
    .before('svgr')
    .loader('babel-loader')
    .options({presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react']})

  if (hot && isDev) {
    wpConfig.plugin('reacthotloader').use(require('@pmmmwh/react-refresh-webpack-plugin'))
  }
}

module.exports = {
  setup
}
