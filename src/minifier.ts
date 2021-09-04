/*!
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

import type { TaggedTemplateExpression, TemplateLiteral } from 'typescript'
import { factory, isNoSubstitutionTemplateLiteral } from 'typescript'
import { cursorTo } from 'readline'
import type { Options } from './transformer'

let nodeCount = 0

const log = (): void => {
  if (nodeCount === 0) process.stdout.write('\n')
  cursorTo(process.stdout, 0)
  process.stdout.write(`[ts-styled-components-plugin] Minified ${++nodeCount} styled components.`)
}

const commentRegex = /((?<!(http:|https:))\/\/.*)|(\/\*[^!][\s\S]*?\*\/)/g
const unnecessaryWhitespaceRegex = /(?<![\w}])\s+|\s+(?=[{}>,;])/g
const expressionPlaceholderRegex = /\${EXP\d+}/g
const specialCssValueRegex = /(?:(['"])((\\\1|[\s\S])*?)\1)|(calc|url)\([\s\S]*?\)(?=;)/g

const createPlaceholder = (identifier: string, index: number, b = true) =>
  b ? `$\{${identifier}${index}}` : ''
const expressionPlaceholderReducer = (acc: string, cur: string, i: number, arr: string[]) =>
  `${acc}${cur}${createPlaceholder('EXP', i, i < arr.length - 1)}`

export const minifyText = (text: string): string => {
  let temp = text
  const generalPlaceholderValues = temp.match(specialCssValueRegex)
  if (generalPlaceholderValues)
    generalPlaceholderValues.forEach((val, i) => {
      temp = temp.replace(val, `\${CSS${i}}`)
    })

  temp = temp.replace(commentRegex, '').replace(unnecessaryWhitespaceRegex, '')

  if (generalPlaceholderValues)
    generalPlaceholderValues.forEach((val, i) => {
      temp = temp.replace(`\${CSS${i}}`, val)
    })

  return temp
}

export const minifyTaggedTemplateExpression = (
  { tag, typeArguments, template }: TaggedTemplateExpression,
  verbose?: Options['verbose']
): TaggedTemplateExpression => {
  const createTTE = (template: TemplateLiteral): TaggedTemplateExpression => {
    if (verbose) log()
    return factory.createTaggedTemplateExpression(tag, typeArguments, template)
  }

  if (isNoSubstitutionTemplateLiteral(template))
    return createTTE(factory.createNoSubstitutionTemplateLiteral(minifyText(template.text)))

  const templateText = [
    template.head.text,
    ...template.templateSpans.map(span => span.literal.text),
  ].reduce(expressionPlaceholderReducer, '')
  const minifiedText = minifyText(templateText)
  const expressions = minifiedText.match(expressionPlaceholderRegex)
  if (!expressions) return createTTE(factory.createNoSubstitutionTemplateLiteral(minifiedText))
  const [head, ...spans] = minifiedText.split(expressionPlaceholderRegex)
  const minifiedTemplate = factory.createTemplateExpression(
    factory.createTemplateHead(head),
    expressions.map((exp, i) => {
      const expressionIndex = parseInt(exp.slice(5, -1))
      return factory.createTemplateSpan(
        template.templateSpans[expressionIndex].expression,
        i < expressions.length - 1
          ? factory.createTemplateMiddle(spans[i])
          : factory.createTemplateTail(spans[i])
      )
    })
  )
  return createTTE(minifiedTemplate)
}

export default minifyTaggedTemplateExpression
