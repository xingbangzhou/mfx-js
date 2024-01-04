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
            absoluteRuntime: false,
          },
        ],
        [require.resolve('@babel/plugin-proposal-decorators'), {legacy: true}],
        [require.resolve('@babel/plugin-proposal-class-properties'), {loose: true}],
      ],
    },
  }

  const reactVersion = mfxEnv.reactVersion
  if (reactVersion) {
    const reactRuntime = compareVersion(reactVersion, '17') === 1 ? 'automatic' : 'classic'
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
