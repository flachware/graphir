import { lerp } from '../geometry.js'


export class Render {
  // Adds the path data of the whole glyph and of each single segment.
  run(glyph) {
    const { segments, closed } = glyph

    if (segments.length === 0) {
      return {
        ...glyph,
        segments,
        d: ''
      }
    }

    const commands = segments.map(segment => this.command(segment))
    const { P0 } = segments[0]
    let d = `M${P0.x},${P0.y}${commands.join('')}`

    if (closed) d += ' Z'

    return {
      ...glyph,
      segments: segments.map((segment, i) => ({
        ...segment,
        d: `M${segment.P0.x},${segment.P0.y}${commands[i]}`
      })),
      d
    }
  }

  command({ P0, T, P3, p0, p3, straight }) {
    if (straight) return ` L${P3.x},${P3.y}`

    const P1 = lerp(P0, T, p0)
    const P2 = lerp(P3, T, p3)

    return ` C${P1.x},${P1.y} ${P2.x},${P2.y} ${P3.x},${P3.y}`
  }
}
