import { distance } from '../geometry.js'


const epsilon = 1e-9

export class Segments {
  run(glyph) {
    const { points, closed } = glyph
    const count = closed ? points.length : points.length - 1
    const segments = []

    for (let i = 0; i < count; i++) {
      const point = points[i]
      const next = points[(i + 1) % points.length]
      const P0 = { x: point.x, y: point.y }
      const P3 = { x: next.x, y: next.y }
      const T = point.controlPoint
      const t1 = T && distance(T, P0)
      const t2 = T && distance(T, P3)
      const smooth = (closed || i < count - 1) && next.smooth

      // Without a control point, or with one on an endpoint, the segment is
      // a straight line. collapsed names the endpoint that T fell onto.
      if (t1 > epsilon && t2 > epsilon) {
        segments.push({ P0, T, P3, t1, t2, smooth })
      } else {
        const collapsed = T && (t1 <= epsilon ? 'start' : 'end')
        segments.push({ P0, P3, straight: true, collapsed, smooth })
      }
    }

    return {
      ...glyph,
      segments
    }
  }
}
