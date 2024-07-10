import path from 'path'
import {
  createModulePackages,
  createPackageFile,
  includeFileInBuild,
  prepend,
  typescriptCopy,
} from './copyFilesUtils.mjs'

const packagePath = process.cwd()
const distPath = path.join(packagePath, './dist')
const srcPath = path.join(packagePath, './src')

async function addLicense(packageData) {
  const license = `/**
 * ${packageData.name} v${packageData.version}
 *
 * @license ${packageData.license}
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
  const extraFiles = process.argv.slice(2)
  try {
    // TypeScript
    await typescriptCopy({from: srcPath, to: distPath})

    const packageData = await createPackageFile()

    await Promise.all(
      ['./README.md', '../../LICENSE', ...extraFiles].map(async file => {
        const [sourcePath, targetPath] = file.split(':')
        await includeFileInBuild(sourcePath, targetPath)
      }),
    )

    await addLicense(packageData)

    await createModulePackages({from: srcPath, to: distPath})
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
