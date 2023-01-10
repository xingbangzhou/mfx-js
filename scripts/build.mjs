import childProcess from 'child_process'
import glob from 'fast-glob'
import path from 'path'
import {promisify} from 'util'
import yargs from 'yargs'
import {getWorkspaceRoot} from './utils.mjs'

const exec = promisify(childProcess.exec)

const validBundles = [
  // legacy build using ES6 modules
  'legacy',
  // modern build with a rolling target using ES6 modules
  'modern',
  // build for node using commonJS modules
  'node',
  // build with a hardcoded target using ES6 modules
  'stable',
]

async function run(args) {
  const {bundle, largeFiles, outDir: relativeOutDir, verbose} = args

  if (validBundles.indexOf(bundle) === -1) {
    throw new TypeError(`Unrecognized bundle '${bundle}'. Did you mean one of "${validBundles.join('", "')}"?`)
  }

  const env = {
    NODE_ENV: 'production',
    BABEL_ENV: bundle,
    MFX_BUILD_VERBOSE: verbose,
  }

  const babelConfigPath = path.resolve(getWorkspaceRoot(), 'babel.config.js')
  const srcDir = path.resolve('./src')
  const extensions = ['.js', '.ts', '.tsx']
  const ignore = ['**/*.d.ts', '**/*.test.js', '**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx']

  const outDir = path.resolve(
    relativeOutDir,
    {
      node: './node',
      modern: './modern',
      stable: './',
      legacy: './legacy',
    }[bundle],
  )

  const babelArgs = [
    '--config-file',
    babelConfigPath,
    '--extensions',
    `"${extensions.join(',')}"`,
    srcDir,
    '--out-dir',
    outDir,
    '--ignore',
    // Need to put these patterns in quotes otherwise they might be evaluated by the used terminal.
    `"${ignore.join('","')}"`,
  ]
  if (largeFiles) {
    babelArgs.push('--compact false')
  }

  const command = ['yarn babel', ...babelArgs].join(' ')

  if (verbose) {
    console.log(`running '${command}' with ${JSON.stringify(env)}`)
  }

  const {stderr, stdout} = await exec(command, {env: {...process.env, ...env}})
  if (stderr) {
    throw new Error(`'${command}' failed with \n${stderr}`)
  }

  if (verbose) {
    console.log(stdout)
  }
}

yargs(process.argv.slice(2))
  .command({
    command: '$0 <bundle>',
    description: 'build package',
    builder: command => {
      return command
        .positional('bundle', {
          description: `Valid bundles: "${validBundles.join('" | "')}"`,
          type: 'string',
        })
        .option('largeFiles', {
          type: 'boolean',
          default: false,
          describe: 'Set to `true` if you know you are transpiling large files.',
        })
        .option('out-dir', {default: './build', type: 'string'})
        .option('verbose', {type: 'boolean'})
    },
    handler: run,
  })
  .help()
  .strict(true)
  .version(false)
  .parse()