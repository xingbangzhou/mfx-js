const fs = require('fs-extra')
const WPConfig = require('webpack-chain')
const { configure, setup } = require('./configure')

const loadWPConfig = async (env, options) => {
  const wpConfig = new WPConfig()
  //
  await setup(wpConfig, env, options)
  await require('./common').setup()
  await require(`./${env}`).setup()
  //
  const { remoteConfigFile, appPackageFile } = configure
  const appPackageJson = appPackageFile ? await fs.readJson(appPackageFile) : {dependencies: {}, devDependencies: {}}
  let remoteConfigFn = undefined
  if (remoteConfigFile) {
    remoteConfigFn = eval(await fs.readFile(remoteConfigFile, 'utf8'))
  }
  if (appPackageJson.dependencies.react) {
    require('./react').setup()
  }
  remoteConfigFn(wpConfig, env, options)

  return wpConfig.toConfig()
}

module.exports = {
  loadWPConfig
}
