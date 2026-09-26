export function curve(t1, t2) {
  const A = Math.max(t1, t2)
  const B = Math.min(t1, t2)

  const kappa = 4 * (Math.sqrt(2) - 1) / 3

  const r = (A / B)

  const p = 1 + (kappa - 1) * Math.pow(2 / (r + 1), 3 / 4)

  return p
}
