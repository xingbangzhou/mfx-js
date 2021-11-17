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
  .option('-pc, --public <public>', '模板 默认为 public/')
  .option('-e, --env <env>', '部署环境 dev、test、prod', 'dev')
  .option('-h, --hot', '启用热更新', false)
  .option('-o, --open', '打开调试页面', true)
  .option('-ps, --progress <progress>', '显示进度 默认为 true')
  .action(({src, public, env, hot, open, progress}) => {
    const grupEnv = env
    progress = progress === 'false' ? false : true
    require('../scripts/dev')({src, public, grupEnv, open, hot, progress})
  })

program
  .command('build')
  .description('构建项目')
  .option('-s, --src <src>', '目标文件 默认为src/index.js')
  .option('-d, --dist <dist>', '目标 默认为 dist/')
  .option('-p, --public <public>', '模板 默认为 public/')
  .option('-e, --env <env>', '部署环境 dev、test、prod 默认为prod', 'prod')
  .option('-ps, --progress <progress>', '显示进度 默认为 false')
  .action(({src, dist, public, env, progress}) => {
    const grupEnv = env
    progress = progress === 'true' ? true : false
    require('../scripts/build')({src, dist, public, grupEnv, progress})
  })

program
  .command('serve')
  .description('正式环境调试')
  .option('-d, --dist <dist>', '目标 默认为 dist/')
  .action(({dist}) => {
    require('../scripts/serve')({dist})
  })

program.parse(process.argv)
