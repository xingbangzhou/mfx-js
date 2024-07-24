// prettier-ignore
export type Vec3 = [number, number, number] | Float32Array

export function normalize(v: Vec3, dst?: Vec3) {
  dst = dst || new Float32Array(3)
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
  // make sure we don't divide by 0.
  if (length > 0.00001) {
    dst[0] = v[0] / length
    dst[1] = v[1] / length
    dst[2] = v[2] / length
  }
  return dst
}

export function subtract(a: Vec3, b: Vec3, dst?: Vec3) {
  dst = dst || new Float32Array(3)

  dst[0] = a[0] - b[0]
  dst[1] = a[1] - b[1]
  dst[2] = a[2] - b[2]

  return dst
}

export function cross(a: Vec3, b: Vec3, dst?: Vec3) {
  dst = dst || new Float32Array(3)

  dst[0] = a[1] * b[2] - a[2] * b[1]
  dst[1] = a[2] * b[0] - a[0] * b[2]
  dst[2] = a[0] * b[1] - a[1] * b[0]

  return dst
}
