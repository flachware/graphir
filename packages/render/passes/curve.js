import { curve } from 'artea/curve.js'


export class Curve {
  run(glyph) {
    return {
      ...glyph,
      segments: glyph.segments.map(segment => segment.straight
        ? segment
        : { ...segment, p: curve(segment.t1, segment.t2) })
    }
  }
}
