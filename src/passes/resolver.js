import path from 'node:path'
import { Parser } from './parser.js'


export class Resolver {
  constructor() {
    this.parser = new Parser()
  }

  run(typeface) {
    return {
      ...typeface,
      graphs: typeface.graphs.map(graph => this.parser.run(path.join('graphs', graph)))
    }
  }
}
