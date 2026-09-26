export class Anisotropy {
  constructor(value) {
    this.value = value
  }

  run(glyph) {
    return {
      ...glyph,
      segments: glyph.segments.map(segment => this.segment(segment))
    }
  }

  // Extends the longer tangent by the anisotropy value.
  segment(segment) {
    if (segment.straight) return segment

    const { t1, t2 } = segment
    const f = 1 + this.value

    return {
      ...segment,
      ...(t1 >= t2 ? { t1: t1 * f } : { t2: t2 * f })
    }
  }
}
