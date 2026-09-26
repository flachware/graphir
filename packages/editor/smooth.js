// Makes the tangents at node N collinear. Tin and Tout are the T points of
// the incoming and outgoing segment, Fin and Fout the far endpoints of those
// segments. The common direction is the bisector of both tangents. Each T
// slides along the tangent at its far endpoint, so the far nodes keep their
// directions. If that is not possible, T is rotated around N instead.
export function collinear(Fin, Tin, N, Tout, Fout) {
  const u = normalize(add(normalize(sub(N, Tin)), normalize(sub(Tout, N))))

  if (!u) return

  place(Tin, Fin, N, scale(u, -1))
  place(Tout, Fout, N, u)
}

// Puts T on the line through N that points away from M, so that M, N and T
// are collinear. T slides along the tangent at its far endpoint F.
export function follow(T, F, N, M) {
  const d = normalize(sub(N, M))

  if (d) place(T, F, N, d)
}

// Moves T along with node N. S is where N and U where T were when the move
// started. The tangent at N keeps its direction from then and T slides along
// the tangent at the far endpoint F. If the tangents are nearly parallel,
// their intersection is ill-defined and T is instead carried along with
// the segment: rotated and scaled like the chord from F to N. T never
// passes N or F, it is mirrored back.
export function carry(T, F, N, S, U) {
  const d = sub(U, S)
  const v = sub(U, F)

  if (parallel(v, d)) {
    similar(T, F, N, S, U)
    return
  }

  const hit = intersect(F, v, N, d)
  T.x = F.x + v.x * hit.s
  T.y = F.y + v.y * hit.s

  mirror(T, N, d)
  guard(T, F, U)
}

// Keeps node N where its T point stays between N and the far endpoint F,
// with the tangent at N in its direction from the start of the move. S is
// where N and U where T were then. If N would push T past F, or pass the
// tangent at F itself, N is mirrored back instead: the tangent keeps its
// angle and N moves away from the pointer.
export function bounce(N, F, S, U) {
  const d = sub(U, S)
  const v = sub(U, F)

  if (parallel(v, d)) return

  const denominator = cross(v, d)
  const w = sub(N, F)
  const a = Math.abs(cross(w, d) / denominator)
  const b = Math.abs(cross(v, w) / denominator)

  N.x = F.x + a * v.x - b * d.x
  N.y = F.y + a * v.y - b * d.y
}

// Keeps T from passing node X, where S is a reference position of T, for
// example where a drag started. If T crossed the line through X
// perpendicular to the direction from X to S, it is mirrored back at that
// line.
export function guard(T, X, S) {
  mirror(T, X, sub(S, X))
}

function mirror(T, X, d) {
  const u = normalize(d)

  if (!u) return

  const k = (T.x - X.x) * u.x + (T.y - X.y) * u.y

  if (k < 0) {
    T.x -= 2 * k * u.x
    T.y -= 2 * k * u.y
  }
}

function place(T, F, N, d) {
  if (slide(T, F, N, d)) return

  const length = Math.hypot(T.x - N.x, T.y - N.y)
  T.x = N.x + d.x * length
  T.y = N.y + d.y * length
}

// Moves T along the line from F through T until it meets the line through
// N in direction d, ahead of both F and N. Returns whether that succeeded.
function slide(T, F, N, d) {
  const v = sub(T, F)
  const hit = intersect(F, v, N, d)

  if (!hit || hit.s <= 0 || hit.t <= 0) return false

  T.x = F.x + v.x * hit.s
  T.y = F.y + v.y * hit.s
  return true
}

// Intersects the lines F + s v and N + t d. Returns null if they are
// parallel.
function intersect(F, v, N, d) {
  const w = sub(N, F)
  const denominator = cross(v, d)

  if (Math.abs(denominator) < 1e-9) return null

  return {
    s: cross(w, d) / denominator,
    t: cross(w, v) / denominator
  }
}

// Whether the directions v and d are within about 6 degrees of parallel.
function parallel(v, d) {
  const length = Math.hypot(v.x, v.y) * Math.hypot(d.x, d.y)

  return !(Math.abs(cross(v, d)) > 0.1 * length)
}

// Moves T like a figure attached to the chord from F to N, which was from
// F to S: rotated and scaled around F. U is where T was.
function similar(T, F, N, S, U) {
  const a = sub(S, F)
  const b = sub(N, F)
  const u = sub(U, F)
  const length = a.x * a.x + a.y * a.y

  if (length < 1e-9) return

  const re = (b.x * a.x + b.y * a.y) / length
  const im = (b.y * a.x - b.x * a.y) / length

  T.x = F.x + re * u.x - im * u.y
  T.y = F.y + im * u.x + re * u.y
}

function add(A, B) {
  return { x: A.x + B.x, y: A.y + B.y }
}

function sub(A, B) {
  return { x: A.x - B.x, y: A.y - B.y }
}

function scale(A, f) {
  return { x: A.x * f, y: A.y * f }
}

function cross(A, B) {
  return A.x * B.y - A.y * B.x
}

function normalize(A) {
  const length = Math.hypot(A.x, A.y)
  return length > 1e-9 ? scale(A, 1 / length) : null
}
