const path = require('path')
const fs = require('fs-extra')
const WebpackChain = require('webpack-chain')

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

const cliEnv = {
  env: undefined,
  options: undefined,
  wpConfig: undefined,
  appDir,
  srcDir: undefined,
  distDir: undefined,
  entry: undefined,
  public: undefined,
  favicon: undefined,
  template: undefined,
  cacheFiles = {
    eslint: path.resolve(appDir, 'node_modules/.cache/.eslintcache'),
    webpack: path.resolve(appDir, 'node_modules/.cache/webpack'),
    buildConfig: path.resolve(appDir, 'node_modules/.cache/.buildConfigCache.json')
  },
  configFile: undefined,
  appPackageFile: undefined
}

const initEnv = async (wpConfig, options, env) => {
  cliEnv.env = env
  cliEnv.options = options
  cliEnv.wpConfig = wpConfig
  cliEnv.srcDir = resolveApp('src')
  cliEnv.distDir = resolveApp('dist')
  cliEnv.entry = await getEntryFile()
  cliEnv.public = resolveApp('public')
  const favicon =  path.join(cliEnv.public, 'favicon.ico')
  const template = path.join(cliEnv.public, 'index.html')
  cliEnv.favicon = fs.existsSync(favicon) ? favicon : path.join(__dirname, '../template/public/favicon.ico')
  cliEnv.template = fs.existsSync(template) ? template : path.join(__dirname, '../template/public/index.html')
  cliEnv.cacheFiles = {
    eslint: path.resolve(appDir, 'node_modules/.cache/.eslintcache'),
    webpack: path.resolve(appDir, 'node_modules/.cache/webpack'),
    buildConfig: path.resolve(appDir, 'node_modules/.cache/.buildConfigCache.json')
  }
  let config = resolveApp(CONFIGNAME)
  let appPackage = resolveApp('package.json')
  const [isRemoteConfig, isRemotePackage] = await Promise.all([
    fs.exists(config),
    fs.exists(appPackage)
  ])
  cliEnv.configFile = isRemoteConfig ? config : undefined
  cliEnv.appPackageFile = isRemotePackage ? appPackage : undefined
},

const loadWPConfig = async (env, options) => {
  const wpConfig = new WebpackChain()
  //
  await initEnv(wpConfig, options, env)
  await require('./common').setup()
  await require(`./${env}`).setup()
  //
  const { configFile, appPackageFile } = cliEnv
  const appPackageJson = appPackageFile ? await fs.readJson(appPackageFile) : {dependencies: {}, devDependencies: {}}
  let configFn = undefined
  if (configFile) {
    configFn = eval(await fs.readFile(configFile, 'utf8'))
  }
  if (appPackageJson.dependencies.react) {
    await require('./react').setup()
  }
  configFn(wpConfig, options, env)

  return wpConfig.toConfig()
}

module.exports = {
  resolveApp,
  cliEnv,
  loadWPConfig,
}
