const q = p => (1 - p) / (p * p)
const qInverse = x => 2 / (1 + Math.sqrt(1 + 4 * x))

// segments: [{ P0, T, P3, p }] with p the Artea curve parameter p_A, or
// [{ A0, A3 }] for a straight segment with fixed endpoint curvatures
// smooth[i]: whether the join between segment i and segment (i + 1) % n
// is smooth
// Returns the parameters [{ p0, p3 }] for
// P1 = P0 + p0(T - P0), P2 = P3 + p3(T - P3), or {} for a straight segment.
export function spline(segments, smooth) {
  const n = segments.length

  const ends = segments.map(({ P0, T, P3, p, A0, A3 }) => {
    if (!T) return { J0: A0, J3: A3 }

    const t1 = Math.hypot(T.x - P0.x, T.y - P0.y)
    const t2 = Math.hypot(T.x - P3.x, T.y - P3.y)
    const S0 = t2 / (t1 * t1)
    const S3 = t1 / (t2 * t2)

    return { S0, S3, J0: q(p) * S0, J3: q(p) * S3 }
  })

  smooth.forEach((isSmooth, i) => {
    if (!isSmooth) return

    const a = ends[i]
    const b = ends[(i + 1) % n]

    a.J3 = b.J0 = Math.min(a.J3, b.J0)
  })

  return ends.map(({ S0, S3, J0, J3 }) => S0 === undefined ? {} : {
    p0: qInverse(J0 / S0),
    p3: qInverse(J3 / S3)
  })
}
