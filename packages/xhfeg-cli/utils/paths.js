const path = require('path')
const fs = require('fs-extra')

const appDir = fs.realpathSync(process.cwd())
const resolveApp = function (relativePath) {
  return path.resolve(appDir, relativePath)
}

let paths = {}

const appPackageJson = resolveApp('package.json')

const isRelExists = relativePath => fs.pathExists(resolveApp(relativePath))
const defaultEntry = async () => {
  const [isIndexTS, isIndexTSX, isMainTS, isMainJS] = await Promise.all([
    isRelExists('src/index.ts'),
    isRelExists('src/index.tsx'),
    isRelExists('src/main.ts'),
    isRelExists('src/main.js'),
  ])
  if (isIndexTS) return resolveApp('src/index.ts')
  if (isIndexTSX) return resolveApp('src/index.tsx')
  else if (isMainTS) return resolveApp('src/main.ts')
  else if (isMainJS) return resolveApp('src/main.js')
  return resolveApp('src/index.js')
}
const initPaths = async ({src, dist, public}) => {
  const appRoot = appDir
  const appSrc = src ? resolveApp(src) : resolveApp('src')
  const entry = src ? resolveApp(src) : await defaultEntry()
  dist = dist ? resolveApp(dist) : resolveApp('dist')
  public = public ? resolveApp(public) : resolveApp('public')
  let favicon = path.join(public, 'favicon.ico')
  let template = path.join(public, 'index.html')
  favicon = fs.existsSync(favicon) ? favicon : path.join(__dirname, '../template/public/favicon.ico')
  template = fs.existsSync(template) ? template : path.join(__dirname, '../template/public/index.html')
  paths = {
    appRoot,
    appSrc,
    appPackageJson,
    entry,
    dist,
    public,
    favicon,
    template
  }
}

const getPaths = () => paths
const cachePaths = {
  eslint: path.resolve(appDir, 'node_modules/.cache/.eslintcache'),
  webpack: path.resolve(appDir, 'node_modules/.cache/webpack'),
  buildConfig: path.resolve(appDir, 'node_modules/.cache/.buildConfigCache.json'),
}

const checkRemote = async () => {
  const remoteConfig = resolveApp('xh-config.js')
  const [isRemoteConfig, isRemotePackageJson] = await Promise.all([
    fs.exists(remoteConfig),
    fs.exists(appPackageJson)
  ])
  const xhPackageJsonPath = isRemotePackageJson ? appPackageJson : null
  let xhConfigPath = isRemoteConfig ? remoteConfig : null
  return {
    xhPackageJsonPath,
    xhConfigPath
  }
}

module.exports = {
  resolveApp,
  initPaths,
  getPaths,
  cachePaths,
  checkRemote
}
