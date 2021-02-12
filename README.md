# ts-styled-components-plugin

[![build](https://github.com/Lchemist/ts-styled-components-plugin/workflows/build/badge.svg)](https://github.com/Lchemist/ts-styled-components-plugin/actions?query=workflow%3Abuild)
[![NPM](https://img.shields.io/npm/v/ts-styled-components-plugin.svg)](https://www.npmjs.com/package/ts-styled-components-plugin)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](https://commitizen.github.io/cz-cli/)
[![Conventional Changelog](https://img.shields.io/badge/changelog-conventional-brightgreen.svg)](https://conventional-changelog.github.io)

A TypeScript transformer plugin that adds minification support to `styled-components`.

## 📦 Installation

```bash
# npm
npm install -D ts-styled-components-plugin
# yarn
yarn add -D ts-styled-components-plugin
```

## 🔨 Usage

1. Install [`ttypescript`](https://www.npmjs.com/package/ttypescript). (As of now, TypeScript does not support using transformer plugins directly from the command line compiler `tsc`.)

2. Add the following config to `tsconfig.json`.

```json
{
  "compilerOptions": {
    "plugins": [{ "transform": "ts-styled-components-plugin" }]
  }
}
```

3. Compile files with command `ttsc`, or use `ttypescript` via bundlers such as [`rollup`](https://www.npmjs.com/package/rollup).

## ⚙️ Options

```ts
// Default to `true`. If `false`, minification will not be applied to code.
minify?: boolean
// Default to `false`. If `true`, plugin will log helpful information to console when compiling, such as how many styled components have been minified.
verbose?: boolean
// Options below are only required if you used any name aliases (other than the original ones) to reference the `styled-components` APIs.
alias?: {
  styled?: string[]
  withConfig?: string[]
  attrs?: string[]
  createGlobalStyle?: string[]
  css?: string[]
  keyframes?: string[]
}
```

```json5
// Example ts.config
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "ts-styled-components-plugin",
        "minify": false,
        "verbose": true,
        "alias": {
          /**
           * @example
           * - fileA: import styled from 'styled-components'
           * - fileB: import styledImportAlias from 'styled-components'
           */
          "styled": ["styled", "styledImportAlias"]
        }
      }
    ]
  }
}
```

## 📖 Supported Syntax

```js
import styled, { createGlobalStyle, css, keyframes } from 'styled-components'

styled.div``
styled('div')``
styled(Component)``
styled.div.withConfig({})``
styled('div').attrs({})``
styled(Component).withConfig({}).attrs({})``
createGlobalStyle``
css``
keyframes``
/**
 * For CSS string value, escaping quote is NOT supported.
 * @example
 * - content: 'escape \' quote is not supported'
 * - content: "escape \" quote is not supported"
 */
styled.div`
  /* supported string syntax */
  content: 'string with single quotes';
  content: 'string with double quotes';
  content: "I'm div";
  content: 'A "good" div';
`
```

## 📚 APIs

Following APIs are useful if you wish to build your own transformer plugin.

```js
import { isStyledComponent, minify } from 'ts-styled-components-plugin'

// If the given node is a styled component, minify it.
if (isStyledComponent(node)) node = minify(node)
```

## 📜 License

[Apache License 2.0](/LICENSE)
