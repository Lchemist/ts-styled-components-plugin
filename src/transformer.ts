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

import type { TransformerFactory, Program, SourceFile, Visitor } from 'typescript'
import { visitEachChild, visitNode } from 'typescript'
import { isStyledComponent } from './detectors'
import minify from './minifier'

export type Options = {
  minify?: boolean
  verbose?: boolean
  alias?: {
    styled?: string[]
    withConfig?: string[]
    attrs?: string[]
    createGlobalStyle?: string[]
    css?: string[]
    keyframes?: string[]
  }
}

const styledComponentsTransformer = (
  _: Program | undefined,
  options: Options
): TransformerFactory<SourceFile> => context => node => {
  const visitor: Visitor = node => {
    if (options.minify !== false && isStyledComponent(node, options.alias))
      node = minify(node, options.verbose)
    return visitEachChild(node, visitor, context)
  }
  return visitNode(node, visitor)
}

export default styledComponentsTransformer
