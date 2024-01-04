import path from 'path'
import fse from 'fs-extra'
import glob from 'fast-glob'

const packagePath = process.cwd()
const distPath = path.join(packagePath, './dist')
const srcPath = path.join(packagePath, './src')

async function includeFileInBuild(file) {
  const sourcePath = path.resolve(packagePath, file)
  const targetPath = path.resolve(distPath, path.basename(file))
  await fse.copy(sourcePath, targetPath)
  console.log(`Copied ${sourcePath} to ${targetPath}`)
}

/**
 * Puts a package.json into every immediate child directory of rootDir.
 * That package.json contains information about esm for bundlers so that imports
 * like import Typography from '@mui/material/Typography' are tree-shakeable.
 *
 * It also tests that an this import can be used in TypeScript by checking
 * if an index.d.ts is present at that path.
 * @param {object} param0
 * @param {string} param0.from
 * @param {string} param0.to
 */
async function createModulePackages({from, to}) {
  const directoryPackages = glob.sync('*/index.{js,ts,tsx}', {cwd: from}).map(path.dirname)

  await Promise.all(
    directoryPackages.map(async directoryPackage => {
      const packageJsonPath = path.join(to, directoryPackage, 'package.json')

      const packageJson = {
        sideEffects: false,
        module: './index.js',
        main: './index.js',
        types: './index.d.ts',
      }

      const [typingsEntryExist, moduleEntryExists, mainEntryExists] = await Promise.all([
        fse.pathExists(path.resolve(path.dirname(packageJsonPath), packageJson.types)),
        fse.pathExists(path.resolve(path.dirname(packageJsonPath), packageJson.module)),
        fse.pathExists(path.resolve(path.dirname(packageJsonPath), packageJson.main)),
        fse.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2)),
      ])

      const manifestErrorMessages = []
      if (!typingsEntryExist) {
        manifestErrorMessages.push(`'types' entry '${packageJson.types}' does not exist`)
      }
      if (!moduleEntryExists) {
        manifestErrorMessages.push(`'module' entry '${packageJson.module}' does not exist`)
      }
      if (!mainEntryExists) {
        manifestErrorMessages.push(`'main' entry '${packageJson.main}' does not exist`)
      }
      if (manifestErrorMessages.length > 0) {
        // TODO: AggregateError
        throw new Error(`${packageJsonPath}:\n${manifestErrorMessages.join('\n')}`)
      }

      return packageJsonPath
    }),
  )
}

async function typescriptCopy({from, to}) {
  if (!(await fse.pathExists(to))) {
    console.warn(`path ${to} does not exists`)
    return []
  }

  const files = await glob('**/*.d.ts', {cwd: from})
  const cmds = files.map(file => fse.copy(path.resolve(from, file), path.resolve(to, file)))
  return Promise.all(cmds)
}

async function createPackageFile() {
  const packageData = await fse.readFile(path.resolve(packagePath, './package.json'), 'utf8')
  const {nyc, scripts, devDependencies, workspaces, ...packageDataOther} = JSON.parse(packageData)

  const newPackageData = {
    ...packageDataOther,
    private: false,
    ...(packageDataOther.main
      ? {
          main: './index.js',
          module: './index.js',
        }
      : {}),
  }

  const typeDefinitionsFilePath = path.resolve(distPath, './index.d.ts')
  if (await fse.pathExists(typeDefinitionsFilePath)) {
    newPackageData.types = './index.d.ts'
  }

  const targetPath = path.resolve(distPath, './package.json')

  await fse.writeFile(targetPath, JSON.stringify(newPackageData, null, 2), 'utf8')
  console.log(`Created package.json in ${targetPath}`)

  return newPackageData
}

async function prepend(file, string) {
  const data = await fse.readFile(file, 'utf8')
  await fse.writeFile(file, string + data, 'utf8')
}

async function addLicense(packageData) {
  const license = `/** @license MFX-JS v${packageData.version}
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
`
  await Promise.all(
    ['./index.js'].map(async file => {
      try {
        await prepend(path.resolve(distPath, file), license)
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.log(`Skipped license for ${file}`)
        } else {
          throw err
        }
      }
    }),
  )
}

async function run() {
  try {
    // TypeScript
    await typescriptCopy({from: srcPath, to: distPath})

    const packageData = await createPackageFile()

    await Promise.all(['./README.md', '../../LICENSE'].map(file => includeFileInBuild(file)))

    await addLicense(packageData)

    await createModulePackages({from: srcPath, to: distPath})
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
