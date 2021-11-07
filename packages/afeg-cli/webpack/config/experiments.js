module.exports = (env, config) => {
  const expConfig = {
    experiments: {
      topLevelAwait: true,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    },
  }
  config.merge(expConfig)
}
