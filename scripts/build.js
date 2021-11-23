const childProcess = require('child_process')
const path = require('path')
const yargs = require('yargs')
const { promisify } = require('util')

const exec = promisify(childProcess.exec)

const validBundles = [
  'legacy',
  'modern',
  'node',
  'stable'
]

async function run(argv) {
  const { boundle, largeFiles, outDir: relativeOutDir, verbose } = argv

  if (validBundles.indexOf(boundle) === -1) {
    throw new TypeError(
      `Unrecognized bundle '${bundle}'. Did you mean one of "${validBundles.join('", "')}"?`,
    )
  }

  const env = {
    NODE_ENV: 'production',
    BABEL_ENV: bundle,
    GRUPJS_BUILD_VERBOSE: verbose
  }

  const babelConfigPath = path.resolve(__dirname, '../babel.config.js')
  const srcDir = path.resolve('./src')
  const extensions = ['.js', '.ts', '.tsx']
  const ignore = [
    '**/*.d.ts'
  ]

  const outDir = path.resolve(
    relativeOutDir,
    {
      node: './node',
      modern: './modern',
      stable: './esm',
      legacy: './legacy'
    }[bundle]
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
    `"${ignore.join('","')}"`
  ]
  if (largeFiles) {
    babelArgs.push('--compact false')
  }

  const command = ['yarn babel', ...babelArgs].join(' ')

  if (verbose) {
    console.log(`running '${command}' with ${JSON.stringify(env)}`)
  }

  const { stderr, stdout } = await exec(command, { env: { ...process.env, ...env } });
  if (stderr) {
    throw new Error(`'${command}' failed with \n${stderr}`);
  }

  if (verbose) {
    // eslint-disable-next-line no-console
    console.log(stdout);
  }
}

yargs
  .command({
    command: '$0 <bundle>',
    description: 'build package',
    builder: (command) => {
      return command
        .positional('bundle', {
          description: `Valid bundles: "${validBundles.join('" | "')}"`,
          type: 'string'
        })
        .option('largeFiles', {
          type: 'boolean',
          default: false,
          describe: 'Set to `true` if you know you are transpiling large files.'
        })
        .option('out-dir', { default: './build', type: 'string' })
        .option('verbose', { type: 'boolean' })
    },
    handler: run
  })
  .help()
  .strict(true)
  .version(false)
  .parse()
