import { Parser } from './passes/parser.js'
import { Resolver } from './passes/resolver.js'


export class Graphir {
  constructor() {
    this.passes = [
      new Parser(),
      new Resolver()
    ]
  }

  compile(typefacePath) {
    let typeface = typefacePath

    for (const pass of this.passes) {
      typeface = pass.run(typeface)
    }

    return typeface
  }
}
