#!/usr/bin/env node
const commander = require('commander')
const package = require('../package.json')

commander
  .version(package.version, '-v, --version')
  .usage('<command> [options]')

commander
  .command('dev')
  .description('Dev 模式')
  .option('-e, --env <env>', '部署环境 dev|test|prod', 'dev')
  .option('-h, --hot', '启用热更新', false)
  .option('-o, --open', '打开调试页面', true)
  .option('-ps, --progress <progress>', '显示进度', 'true')
  .action(({env, hot, open, progress}) => {
    const livEnv = env
    require('../cli/dev')({livEnv, hot, open, progress})
  })

commander
  .command('build')
  .description('构建项目')
  .option('-e, --env <env>', '部署环境 dev|test|prod', 'prod')
  .option('-ps, --progress <progress>', '显示进度', 'true')
  .action(({env, progress}) => {
    const livEnv = env
    require('../cli/build')({livEnv, progress})
  })

commander
  .command('serve')
  .description('正式环境调试')
  .action(() => {
    const livEnv = 'prod'
    require('../cli/serve')({livEnv})
  })

commander.parse(process.argv)
