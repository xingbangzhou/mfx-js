const { getPaths } = require('../../utils/paths')
const { public, dist } = getPaths()

module.exports = (env, { hot, open }) => {
  return {
    devServer: {
      bonjour: true,
      port: 8000,
      allowedHosts: 'all',
      historyApiFallback: true,
      open,
      hot: hot === true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      },
      static: [
        {
          directory: public,
          publicPath: '/',
        },
        {
          directory: dist,
          publicPath: '/',
          staticOptions: {
            setHeaders: function (res, path) {
              if (path.toString().endsWith('.d.ts')) res.set('Content-Type', 'application/javascript; charset=utf-8')
            }
          }
        }
      ],
      client: {
        overlay: true,
      }
    }
  }
}
