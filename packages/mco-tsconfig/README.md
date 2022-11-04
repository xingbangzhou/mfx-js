# TSConfig

## Install
+ `yarn add tsconfig-mco -D`

## Config
+ `tsconfig.json`
```js
module.exports = {
  "extends": "tsconfig-mco",
  "compilerOptions": {
    "types": ["node", "react", "tsconfig-mco"],
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "src/*": ["src/*"]
    },
  }
}
```
