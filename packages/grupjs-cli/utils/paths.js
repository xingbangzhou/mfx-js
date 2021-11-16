const path = require('path')
const fs = require('fs-extra')

let paths = {}
const appDir = fs.realpathSync(process.cwd())

const resolveApp = function (relativePath) {
  return path.resolve(appDir, relativePath)
}
const isPathExists = relativePath => fs.pathExists(resolveApp(relativePath))
const defaultEntry = async () => {
  if (await isPathExists('src/index.ts')) return resolveApp('src/index.ts')
  if (await isPathExists('src/index.tsx')) return resolveApp('src/index.tsx')
  return resolveApp('src/index.js')
}

const setPaths = async ({src, dist, public}) => {
  const srcDir = src ? resolveApp(src) : resolveApp('src')
  const entry = src ? resolveApp(src) : await defaultEntry()
  dist = dist ? resolveApp(dist) : resolveApp('dist')
  public = public ? resolveApp(public) : resolveApp('public')
  let favicon = path.join(public, 'favicon.ico')
  let template = path.join(public, 'index.html')
  favicon = fs.existsSync(favicon) ? favicon : path.join(__dirname, '../template/public/favicon.ico')
  template = fs.existsSync(template) ? template : path.join(__dirname, '../template/public/index.html')
  paths = {
    appDir,
    srcDir,
    entry,
    dist,
    public,
    favicon,
    template
  }
}

const getPaths = () => paths

const getCachePaths = () => ({
  eslint: path.resolve(appDir, 'node_modules/.cache/.eslintcache'),
  webpack: path.resolve(appDir, 'node_modules/.cache/webpack'),
  buildConfig: path.resolve(appDir, 'node_modules/.cache/.buildConfigCache.json')
})

const getRemotePaths = async () => {
  let grupConfigPath = resolveApp('grup-config.js')
  let appPackagePath = resolveApp('package.json')
  const [isRemoteConfig, isRemotePackage] = await Promise.all([
    fs.exists(grupConfigPath),
    fs.exists(appPackagePath)
  ])
  appPackagePath = isRemotePackage ? appPackagePath : null
  grupConfigPath = isRemoteConfig ? grupConfigPath : null

  return {
    appPackagePath,
    grupConfigPath
  }
}

module.exports = {
  resolveApp,
  setPaths,
  getPaths,
  getCachePaths,
  getRemotePaths
}
