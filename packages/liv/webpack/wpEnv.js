const path = require('path')
const fs = require('fs-extra')

const CONFIGNAME = 'liv-config.js'

const appDir = fs.realpathSync(process.cwd())

const resolveApp = function (relativePath) {
  return path.resolve(appDir, relativePath)
}

const isFileExist = function (relativePath) {
  return fs.pathExists(resolveApp(relativePath))
}

const getEntryFile = async () => {
  if (await isFileExist('src/index.ts')) return resolveApp('src/index.ts')
  if (await isFileExist('src/index.tsx')) return resolveApp('src/index.tsx')
  return resolveApp('src/index.js')
}

const cacheFiles = {
  eslint: path.resolve(appDir, 'node_modules/.cache/.eslintcache'),
  webpack: path.resolve(appDir, 'node_modules/.cache/webpack'),
  buildConfig: path.resolve(appDir, 'node_modules/.cache/.buildConfigCache.json')
}

const getCacheFiles = () => cacheFiles

const wpEnv = {}

const initEnv = async (wpConfig, env, options) => {
  wpEnv.wpConfig = wpConfig
  wpEnv.env = env
  wpEnv.options = options
  wpEnv.srcDir = resolveApp('src')
  wpEnv.distDir = resolveApp('dist')
  wpEnv.entry = await getEntryFile()
  wpEnv.public = resolveApp('public')
  const favicon =  path.join(wpEnv.public, 'favicon.ico')
  const template = path.join(wpEnv.public, 'index.html')
  wpEnv.favicon = fs.existsSync(favicon) ? favicon : path.join(__dirname, '../template/public/favicon.ico')
  wpEnv.template = fs.existsSync(template) ? template : path.join(__dirname, '../template/public/index.html')
  let remoteConfig = resolveApp(CONFIGNAME)
  let appPackage = resolveApp('package.json')
  const [isRemoteConfig, isRemotePackage] = await Promise.all([
    fs.exists(remoteConfig),
    fs.exists(appPackage)
  ])
  wpEnv.remoteConfigFile = isRemoteConfig ? remoteConfig : undefined
  wpEnv.appPackageFile = isRemotePackage ? appPackage : undefined
}

module.exports = {
  wpEnv,
  resolveApp,
  initEnv,
  getCacheFiles
}
