export function lerp(A, B, t) {
  return { x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t }
}

export function distance(A, B) {
  return Math.hypot(B.x - A.x, B.y - A.y)
}
