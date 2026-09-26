import { spline } from 'artea/spline.js'


export class Spline {
  // Straight segments take part in the joins with fixed curvatures: 0 at
  // their ends, as for a line. Where T collapsed onto an endpoint, the
  // curvature there tends to infinity, so the neighbor keeps its own.
  run(glyph) {
    const { segments } = glyph

    const input = segments.map(segment => segment.straight
      ? {
          A0: segment.collapsed === 'start' ? Infinity : 0,
          A3: segment.collapsed === 'end' ? Infinity : 0
        }
      : segment)

    const parameters = spline(input, segments.map(segment => segment.smooth))

    return {
      ...glyph,
      segments: segments.map((segment, i) => ({
        ...segment,
        ...parameters[i]
      }))
    }
  }
}
