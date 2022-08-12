# TSConfig

## Install
+ `yarn add @mco/tsconfig -D`

## Config
+ `tsconfig.json`
```js
module.exports = {
  "extends": "@mco/tsconfig",
  "compilerOptions": {
    "types": ["node", "react", "@mco/tsconfig"],
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "src/*": ["src/*"]
    },
  }
}
```
