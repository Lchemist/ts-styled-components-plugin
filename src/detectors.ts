/*
Copyright 2021 Yusipeng Xuan

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import type { Node, LeftHandSideExpression, TaggedTemplateExpression } from 'typescript'
import {
  isIdentifier,
  isCallExpression,
  isPropertyAccessExpression,
  isTaggedTemplateExpression,
} from 'typescript'
import type { Options } from './transformer'

const isAliasArray = (aliasArray: unknown): aliasArray is string[] =>
  Array.isArray(aliasArray) &&
  aliasArray.length > 0 &&
  !aliasArray.some(alias => typeof alias !== 'string')

export const isStyledFunction = (
  tag: LeftHandSideExpression,
  alias?: Options['alias']
): boolean => {
  const styled = alias?.styled ?? ['styled']
  const withConfig = alias?.withConfig ?? ['withConfig']
  const attrs = alias?.attrs ?? ['attrs']
  const createGlobalStyle = alias?.createGlobalStyle ?? ['createGlobalStyle']
  const css = alias?.css ?? ['css']
  const keyframes = alias?.keyframes ?? ['keyframes']

  if (
    isPropertyAccessExpression(tag) &&
    isIdentifier(tag.expression) &&
    isAliasArray(styled) &&
    styled.includes(tag.expression.text)
  )
    return true

  if (isCallExpression(tag) && tag.arguments.length === 1) {
    if (
      isIdentifier(tag.expression) &&
      isAliasArray(styled) &&
      styled.includes(tag.expression.text)
    )
      return true

    if (
      isPropertyAccessExpression(tag.expression) &&
      isAliasArray(withConfig) &&
      isAliasArray(attrs) &&
      [...withConfig, ...attrs].includes(tag.expression.name.text) &&
      isStyledFunction(tag.expression.expression, alias)
    )
      return true
  }

  if (
    isIdentifier(tag) &&
    isAliasArray(createGlobalStyle) &&
    isAliasArray(css) &&
    isAliasArray(keyframes) &&
    [...createGlobalStyle, ...css, ...keyframes].includes(tag.text)
  )
    return true

  return false
}

export const isStyledComponent = (
  node: Node,
  alias?: Options['alias']
): node is TaggedTemplateExpression =>
  isTaggedTemplateExpression(node) && isStyledFunction(node.tag, alias)
