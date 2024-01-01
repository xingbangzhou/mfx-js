#!/usr/bin/env node
// const moduleAlias = require('module-alias')
const path = require('path')
const program = require('commander')
const package = require('../package.json')

// Register alias
// moduleAlias.addAlias('src', __dirname + '/../src')
// moduleAlias({base: path.resolve(__dirname, '..') + '/package.json'})

const {mfx} = require(`../dist/index.js`).default

program.version(package.version, '-v, --version').usage('<command> [options]')

program
  .command('dev')
  .description('Dev 模式')
  .option('-e, --env <env>', '部署环境 dev|test|prod', 'dev')
  .option('-ps, --progress', '显示进度', true)
  .action(options => {
    mfx('dev', 'development', options)
  })

program
  .command('build')
  .description('构建项目')
  .option('-e, --env <env>', '部署环境 dev|test|prod', 'prod')
  .option('-ps, --progress', '显示进度', false)
  .option('-a, --analyze', '生成分析报告', false)
  .action(options => {
    mfx('build', 'production', options)
  })

program
  .command('serve')
  .description('正式环境调试')
  .action(() => {
    mfx('serve', 'serve', {open: true})
  })

program.parse(process.argv)
