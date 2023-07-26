import {mfxConfig, mfxEnv} from 'src/core'
import {compareVersion} from 'src/utils/version'

interface BabelLoaderRule {
  loader: string
  options: {
    presets: any[]
    plugins: any[]
  }
}

export default function babelLoader() {
  const reactVersion = mfxEnv.reactVersion
  let reactRuntime: string | undefined = undefined

  if (reactVersion) {
    const hasReact17 = compareVersion(reactVersion, '17') === 1
    reactRuntime = hasReact17 ? 'automatic' : 'classic'
  }

  const loaderRule: BabelLoaderRule = {
    loader: require.resolve('babel-loader'),
    options: {
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            useBuiltIns: 'entry',
            corejs: 3,
            exclude: ['transform-typeof-symbol'],
            loose: true,
          },
        ],
        require.resolve('@babel/preset-typescript'),
      ],
      plugins: [
        [require(require.resolve('@babel/plugin-syntax-top-level-await')).default],
        [
          require.resolve('@babel/plugin-transform-runtime'),
          {
            corejs: false,
            helpers: true,
            version: require(require.resolve('@babel/runtime/package.json')).version,
            regenerator: true,
            useESModules: false,
          },
        ],
        [require.resolve('@babel/plugin-proposal-decorators'), {legacy: true}],
        [require.resolve('@babel/plugin-proposal-class-properties'), {loose: true}],
      ],
    },
  }

  if (reactRuntime) {
    loaderRule.options.presets.push([
      require.resolve('@babel/preset-react'),
      {
        runtime: reactRuntime,
      },
    ])
    // react-refresh
    mfxEnv.isDev &&
      mfxConfig.devServer?.hot &&
      mfxEnv.reactVersion &&
      loaderRule.options.plugins.unshift(require.resolve('react-refresh/babel'))
  }

  return {babel: loaderRule}
}
