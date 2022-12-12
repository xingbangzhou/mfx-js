# TSConfig

## Install
+ `yarn add @mscx/tsconfig -D`

## Config
+ `tsconfig.json`
```js
module.exports = {
  "extends": "@mscx/tsconfig",
  "compilerOptions": {
    "types": ["node", "react", "@mscx/tsconfig"],
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "src/*": ["src/*"]
    },
  }
}
```
