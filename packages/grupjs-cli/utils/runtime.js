const webpack = require('webpack')
const fs = require('fs-extra')
const { getRemotePaths } = require('./paths')
const withReact = require('../framework/react')

class RuntimeCompile {
  parameters = {}
  op = {} // grup-config.js 函数参数
  appPackageJson = {}
  grupConfigJson = {}

  async setup(args, config, env, paths) {
    const {
      appPackagePath,
      grupConfigPath
    } = await getRemotePaths()

    this.parameters = {args, config, env, paths, appPackagePath, grupConfigPath}
    this.op = {...args, config, env, webpack}
  }

  async run() {
    await this.run0()
    const webpackConfig = this.parameters.config.toConfig()

    return { webpackConfig }
  }

  isReact() {
    return !!this.appPackageJson.dependencies.react
  }

  async run0() {
    this.appPackageJson = this.parameters.appPackagePath ?
      await fs.readJSON(this.parameters.appPackagePath) : { dependencies: {}, devDependencies: {} }

    let grupConfig = undefined
    if (this.parameters.grupConfigPath) {
      grupConfig = require(this.parameters.grupConfigPath)
      if (typeof grupConfig === 'object') {
        this.grupConfigJson = grupConfig
      }
      if (typeof grupConfig === 'function') {
        if(this.isReact()) {
          withReact(grupConfig)(this.op)
        } else {
          await grupConfig(this.op)
        }
      } else if (Object.keys(grupConfig).length > 0) {
        await this.resolveGrupJson()
      }
    } else {
      if (this.isReact()) {
        withReact(grupConfig)(this.op)
      }
    }
  }

  async resolveGrupJson() {
    const op = {
      webpackEnv: this.op.env,
      webpackChain: this.parameters.config,
      ...this.op,
    }
    if (this.isReact()) {
      await withReact()(this.op)
    }
    // module federation
    if (this.grupConfigJson.moduleFederation) {
      const moduleFederation = typeof this.grupConfigJson.moduleFederation === 'function'
        ? await this.grupConfigJson.moduleFederation(op)
        : this.grupConfigJson.moduleFederation
      moduleFederation.filename = moduleFederation.filename || 'grup.js'
      this.parameters.config.plugin('mf').tap(args => {
        args[0] = {
          ...args[0],
          ...moduleFederation
        }
        return args
      })
    }
    // webpack chain
    if (this.grupConfigJson.webpackChain && typeof this.grupConfigJson.webpackChain === 'function') {
      await this.grupConfigJson.webpackChain(this.parameters.config, this.op)
    }
    // webpack
    if (this.grupConfigJson.webpack && typeof this.grupConfigJson.webpack === 'function') {
      const wpc = await this.grupConfigJsongrupConfigJson.webpack(op)
      this.parameters.config.merge(wpc)
    }
    // module generator
    if (this.grupConfigJson.moduleGenerator) {
      const moduleGenerator =
      typeof this.grupConfigJson.moduleGenerator === 'function'
        ? await this.grupConfigJson.moduleGenerator(op)
        : this.grupConfigJson.moduleGenerator
      if (typeof moduleGenerator === 'string') {
        this.parameters.config.merge({
          module: {
            generator: {
              'asset/resource': {
                publicPath: moduleGenerator
              }
            }
          }
        })
      } else {
        this.parameters.config.merge({module: {generator: moduleGenerator}})
      }
    }
  }
}

module.exports = new RuntimeCompile()
