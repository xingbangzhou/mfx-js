#!/usr/bin/env node

const program = require('commander')

const package = require('../package.json')

program
  .version(package.version, '-v, --version')
  .usage('<command> [options]')

program
  .command('dev')
  .description('调试项目')
  .option('-s, --src <src>', '目标文件 默认为src/index.js')
  .option('-p, --public <public>', '模板 默认为 public/')
  .option('-e, --env <env>', '部署环境 dev、test、prod', 'dev')
  .option('-h, --hot', '启用热更新', false)
  .option('-o, --open', '打开调试页面', true)
  .action(({src, public, env, hot, open}) => {
    const grupEnv = env || 'dev'
    open = open === 'false' ? false : true
    require('../scripts/dev')({src, public, grupEnv, open, hot})
  })

program
  .command('build')
  .description('构建项目')
  .option('-s, --src <src>', '目标文件 默认为src/index.[jt]s')
  .option('-d, --dist <dist>', '目标 默认为 dist/')
  .option('-pub, --public <public>', '模板 默认为 public/')
  .option('-e, --env <env>', '部署环境 dev、test、prod 默认为dev')
  .action(({src, dist, public, env}) => {
    const gjEnv = env || 'prod'
    require('../scripts/build')({
      src, dist, public, gjEnv
    })
  })

program.parse(process.argv)
