import { Path } from './path.js'


export class Group {
  constructor(children = [], transform) {
    this.type = 'group'
    this.children = children
    this.transform = transform
  }
}

export function scene(glyphs) {
  return new Group(glyphs.map(glyph => new Group([new Path(glyph.d)])))
}
