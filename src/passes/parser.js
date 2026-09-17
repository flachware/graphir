import fs from 'node:fs'
import { parse } from 'yaml'


export class Parser {
  run(typeface) {
    const file = fs.readFileSync(typeface, 'utf8')

    return parse(file)
  }
}
