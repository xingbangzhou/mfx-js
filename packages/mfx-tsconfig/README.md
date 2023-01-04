# TSConfig

## Install
+ `yarn add @mfx0/tsconfig -D`

## Config
+ `tsconfig.json`
```js
module.exports = {
  "extends": "@mfx0/tsconfig",
  "compilerOptions": {
    "types": ["node", "react", "@mfx0/tsconfig"],
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "src/*": ["src/*"]
    },
  }
}
```
