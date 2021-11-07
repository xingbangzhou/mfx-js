
const reactNewJsx = { runtime: 'automatic' }

module.exports = {
  withReact(env, config, { hot }) {
    const isDev = env === 'development'
    config.module
      .rule('scripts')
      .use('babel')
      .tap(o => {
        o.presets.push(['@babel/preset-react', reactNewJsx])
        isDev && hot && o.plugins.unshift(require.resolve('react-refresh/babel'))
        return o
      })
    config.module
      .rule('svg')
      .use('svgr')
      .before('url')
      .loader('@svgr/webpack')
      .options({babel: false})
      .end()
      .use('babel')
      .before('svgr')
      .loader('babel-loader')
      .options({presets: [
        '@babel/preset-env',
        '@babel/preset-typescript',
        ['@babel/preset-react', reactNewJsx]
      ]})

    if (hot && isDev) {
      config.plugin('reacthotloader').use(require('@pmmmwh/react-refresh-webpack-plugin'))
    }
  }
}
