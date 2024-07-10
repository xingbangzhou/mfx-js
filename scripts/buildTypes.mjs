import childProcess from 'child_process'
import glob from 'fast-glob'
import fse from 'fs-extra'
import path from 'path'
import {promisify} from 'util'
import yargs from 'yargs'

const exec = promisify(childProcess.exec)

async function main() {
  const packageRoot = process.cwd()

  const tsconfigPath = path.join(packageRoot, 'tsconfig.build.json')
  if (!fse.existsSync(tsconfigPath)) {
    throw new Error(
      'Unable to find a tsconfig to build this project. ' +
        `The package root needs to contain a 'tsconfig.build.json'. ` +
        `The package root is '${packageRoot}'`,
    )
  }

  await exec(['pnpm', 'tsc', '-b', tsconfigPath].join(' '))

  const publishDir = path.join(packageRoot, 'dist')
  const declarationFiles = await glob('**/*.d.ts', {absolute: true, cwd: publishDir})
  if (declarationFiles.length === 0) {
    throw new Error(`Unable to find declaration files in '${publishDir}'`)
  }

  // eslint-disable-next-line no-console -- Verbose logging
  console.log(`Total: ${declarationFiles.length}`)
}

yargs(process.argv.slice(2))
  .command({
    command: '$0',
    description: 'Builds a project with a fix for https://github.com/microsoft/TypeScript/issues/39117',
    handler: main,
  })
  .help()
  .strict(true)
  .version(false)
  .parse()
