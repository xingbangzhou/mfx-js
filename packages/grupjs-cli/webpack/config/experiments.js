module.exports = (env, config) => {
  const expers = {
    experiments: {
      topLevelAwait: true,
      asyncWebAssembly: true,
      syncWebAssembly: true,
      backCompat: true
    },
  }
  config.merge(expers)
}
