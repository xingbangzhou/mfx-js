# TSConfig

## Install
+ `yarn add @mfx-js/tsconfig -D`

## Config
+ `tsconfig.json`
```js
module.exports = {
  "extends": "@mfx-js/tsconfig",
  "compilerOptions": {
    "types": ["node", "react", "@mfx-js/tsconfig"],
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "src/*": ["src/*"]
    },
  }
}
```
