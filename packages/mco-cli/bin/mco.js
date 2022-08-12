#!/usr/bin/env node
const program = require('commander')
const package = require('../package.json')

const {exec} = require(`../dist/index.js`).default

program.version(package.version, '-v, --version').usage('<command> [options]')

program
  .command('dev')
  .description('Dev 模式')
  .option('-e, --env <env>', '部署环境 dev|test|prod', 'dev')
  .option('-h, --hot', '启用热更新', false)
  .option('-o, --open', '打开调试页面', true)
  .option('-ps, --progress', '显示进度', true)
  .action(options => {
    exec('dev', 'development', options)
  })

program
  .command('build')
  .description('构建项目')
  .option('-e, --env <env>', '部署环境 dev|test|prod', 'prod')
  .option('-a, --analyze', '生成分析报告', false)
  .option('-ps, --progress', '显示进度', false)
  .action(options => {
    exec('build', 'production', options)
  })

program
  .command('serve')
  .description('正式环境调试')
  .action(() => {
    exec('serve', 'serve', {open: true})
  })

program.parse(process.argv)
