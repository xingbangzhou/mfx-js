import chalk from 'chalk'
import {mfxEnv} from 'src/core'

export const logTitle = function (title: string) {
  console.log(
    `${chalk.cyan.bgHex('#FFA500').bold(` MFX v${mfxEnv.version} `)} ${chalk.bgHex('#0969da')(` ${title} `)} \n`,
  )
}
