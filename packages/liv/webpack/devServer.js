module.exports = (hot, open, public) => ({
  devServer: {
    port: 8000,
    historyApiFallback: true,
    hot: hot === true,
    open: open,
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
    ]
  }
})
