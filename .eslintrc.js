module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ], //使用推荐的React代码检测规范
  plugins: ['@typescript-eslint'],
  env: {
    browser: true,
    es6: true,
    node: true
  },
  settings: {
    //自动发现React的版本，从而进行规范react代码
    react: {
      pragma: 'React',
      version: 'detect'
    }
  },
  parserOptions: {
    //指定ESLint可以解析JSX语法
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'react/react-in-jsx-scope': 'off', // 支持 "runtime": "automatic"
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    // '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/class-name-casing': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react-hooks/rules-of-hooks': 'warn',
    'react-hooks/exhaustive-deps': 'off',
    'prettier/prettier': [
      'error',
      {
        printWidth: 120,
        semi: false,
        singleQuote: true,
        trailingComma: 'all',
        bracketSpacing: false,
        jsxBracketSameLine: true,
        arrowParens: 'avoid',
        insertPragma: false,
        tabWidth: 2,
        useTabs: false,
        endOfLine: 'auto'
      }
    ]
  },
  overrides: [
    {
      files: ['*.tsx', '*.ts'],
      rules: {
        'no-unused-vars': 'off',
        'react/prop-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/camelcase': ['off'],
        '@typescript-eslint/ban-types': [
          'error',
          {
            types: {
              Function: false
            }
          }
        ]
      }
    }
  ]
}
