const { cliEnv } = require('.')

const setup = function () {
  const { wpConfig, options, public } = cliEnv
  const { hot } = options

  wpConfig.merge({
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      port: 8000,
      firewall: false,
      historyApiFallback: true,
      hot: hot === true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      },
      static: [
        {
          directory: public,
          publicPath: '/'
        }
      ],
      overlay: !hot
    }
  })
}

module.exports = {
  setup
}
