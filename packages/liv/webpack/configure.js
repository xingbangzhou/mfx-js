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

const configure = {}

const setup = async (wpConfig, env, options) => {
  configure.wpConfig = wpConfig
  configure.env = env
  configure.options = options
  configure.srcDir = resolveApp('src')
  configure.distDir = resolveApp('dist')
  configure.entry = await getEntryFile()
  configure.public = resolveApp('public')
  const favicon =  path.join(configure.public, 'favicon.ico')
  const template = path.join(configure.public, 'index.html')
  configure.favicon = fs.existsSync(favicon) ? favicon : path.join(__dirname, '../template/public/favicon.ico')
  configure.template = fs.existsSync(template) ? template : path.join(__dirname, '../template/public/index.html')
  let remoteConfig = resolveApp(CONFIGNAME)
  let appPackage = resolveApp('package.json')
  const [isRemoteConfig, isRemotePackage] = await Promise.all([
    fs.exists(remoteConfig),
    fs.exists(appPackage)
  ])
  configure.remoteConfigFile = isRemoteConfig ? remoteConfig : undefined
  configure.appPackageFile = isRemotePackage ? appPackage : undefined
}

module.exports = {
  configure,
  setup,
  resolveApp,
  getCacheFiles
}
