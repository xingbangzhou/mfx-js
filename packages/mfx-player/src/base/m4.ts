import {degToRad} from './algorithms'

// prettier-ignore
export type Mat4 =
| [number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number]
| Float32Array

// prettier-ignore
export type Vec3 = [number, number, number] | Float32Array

// 创建默认矩阵
export function identity(dst?: Mat4) {
  dst = dst || new Float32Array(16)

  dst[0 * 4 + 0] = 1
  dst[0 * 4 + 1] = 0
  dst[0 * 4 + 2] = 0
  dst[0 * 4 + 3] = 0
  dst[1 * 4 + 0] = 0
  dst[1 * 4 + 1] = 1
  dst[1 * 4 + 2] = 0
  dst[1 * 4 + 3] = 0
  dst[2 * 4 + 0] = 0
  dst[2 * 4 + 1] = 0
  dst[2 * 4 + 2] = 1
  dst[2 * 4 + 3] = 0
  dst[3 * 4 + 0] = 0
  dst[3 * 4 + 1] = 0
  dst[3 * 4 + 2] = 0
  dst[3 * 4 + 3] = 1

  return dst
}

// 透视投影 fieldOfViewInRadians: 0~360
export function perspective(fieldOfViewInRadians: number, aspect: number, near: number, far: number, dst?: Mat4) {
  dst = dst || new Float32Array(16)
  const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians)
  const rangeInv = 1.0 / (near - far)

  dst[0] = f / aspect
  dst[1] = 0
  dst[2] = 0
  dst[3] = 0
  dst[4] = 0
  dst[5] = f
  dst[6] = 0
  dst[7] = 0
  dst[8] = 0
  dst[9] = 0
  dst[10] = (near + far) * rangeInv
  dst[11] = -1
  dst[12] = 0
  dst[13] = 0
  dst[14] = near * far * rangeInv * 2
  dst[15] = 0

  return dst
}

// 矩阵相乘
export function multiply(a: Mat4, b: Mat4, dst?: Mat4) {
  dst = dst || new Float32Array(16)
  const b00 = b[0 * 4 + 0]
  const b01 = b[0 * 4 + 1]
  const b02 = b[0 * 4 + 2]
  const b03 = b[0 * 4 + 3]
  const b10 = b[1 * 4 + 0]
  const b11 = b[1 * 4 + 1]
  const b12 = b[1 * 4 + 2]
  const b13 = b[1 * 4 + 3]
  const b20 = b[2 * 4 + 0]
  const b21 = b[2 * 4 + 1]
  const b22 = b[2 * 4 + 2]
  const b23 = b[2 * 4 + 3]
  const b30 = b[3 * 4 + 0]
  const b31 = b[3 * 4 + 1]
  const b32 = b[3 * 4 + 2]
  const b33 = b[3 * 4 + 3]
  const a00 = a[0 * 4 + 0]
  const a01 = a[0 * 4 + 1]
  const a02 = a[0 * 4 + 2]
  const a03 = a[0 * 4 + 3]
  const a10 = a[1 * 4 + 0]
  const a11 = a[1 * 4 + 1]
  const a12 = a[1 * 4 + 2]
  const a13 = a[1 * 4 + 3]
  const a20 = a[2 * 4 + 0]
  const a21 = a[2 * 4 + 1]
  const a22 = a[2 * 4 + 2]
  const a23 = a[2 * 4 + 3]
  const a30 = a[3 * 4 + 0]
  const a31 = a[3 * 4 + 1]
  const a32 = a[3 * 4 + 2]
  const a33 = a[3 * 4 + 3]
  dst[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30
  dst[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31
  dst[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32
  dst[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33
  dst[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30
  dst[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31
  dst[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32
  dst[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33
  dst[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30
  dst[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31
  dst[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32
  dst[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33
  dst[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30
  dst[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31
  dst[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32
  dst[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
  return dst
}

// 创建平移矩阵
export function translation(tx: number, ty: number, tz: number, dst?: Mat4) {
  dst = dst || new Float32Array(16)

  dst[0] = 1
  dst[1] = 0
  dst[2] = 0
  dst[3] = 0
  dst[4] = 0
  dst[5] = 1
  dst[6] = 0
  dst[7] = 0
  dst[8] = 0
  dst[9] = 0
  dst[10] = 1
  dst[11] = 0
  dst[12] = tx
  dst[13] = ty
  dst[14] = tz
  dst[15] = 1

  return dst
}

// 平移
export function translate(m: Mat4, tx: number, ty: number, tz: number, dst?: Mat4) {
  // This is the optimized version of
  return multiply(m, translation(tx, ty, tz), dst)
  // dst = dst || new Float32Array(16)

  // const m00 = m[0]
  // const m01 = m[1]
  // const m02 = m[2]
  // const m03 = m[3]
  // const m10 = m[1 * 4 + 0]
  // const m11 = m[1 * 4 + 1]
  // const m12 = m[1 * 4 + 2]
  // const m13 = m[1 * 4 + 3]
  // const m20 = m[2 * 4 + 0]
  // const m21 = m[2 * 4 + 1]
  // const m22 = m[2 * 4 + 2]
  // const m23 = m[2 * 4 + 3]
  // const m30 = m[3 * 4 + 0]
  // const m31 = m[3 * 4 + 1]
  // const m32 = m[3 * 4 + 2]
  // const m33 = m[3 * 4 + 3]

  // if (m !== dst) {
  //   dst[0] = m00
  //   dst[1] = m01
  //   dst[2] = m02
  //   dst[3] = m03
  //   dst[4] = m10
  //   dst[5] = m11
  //   dst[6] = m12
  //   dst[7] = m13
  //   dst[8] = m20
  //   dst[9] = m21
  //   dst[10] = m22
  //   dst[11] = m23
  // }

  // dst[12] = m00 * tx + m10 * ty + m20 * tz + m30
  // dst[13] = m01 * tx + m11 * ty + m21 * tz + m31
  // dst[14] = m02 * tx + m12 * ty + m22 * tz + m32
  // dst[15] = m03 * tx + m13 * ty + m23 * tz + m33

  // return dst
}

// X轴旋转
export function xRotation(angleInRadians: number, dst?: Mat4) {
  dst = dst || new Float32Array(16)
  const c = Math.cos(angleInRadians)
  const s = Math.sin(angleInRadians)

  dst[0] = 1
  dst[1] = 0
  dst[2] = 0
  dst[3] = 0
  dst[4] = 0
  dst[5] = c
  dst[6] = s
  dst[7] = 0
  dst[8] = 0
  dst[9] = -s
  dst[10] = c
  dst[11] = 0
  dst[12] = 0
  dst[13] = 0
  dst[14] = 0
  dst[15] = 1

  return dst
}

export function xRotate(m: Mat4, angleInRadians: number, dst?: Mat4) {
  // this is the optimized version of
  // return multiply(m, xRotation(angleInRadians), dst)
  dst = dst || new Float32Array(16)

  const m10 = m[4]
  const m11 = m[5]
  const m12 = m[6]
  const m13 = m[7]
  const m20 = m[8]
  const m21 = m[9]
  const m22 = m[10]
  const m23 = m[11]
  const c = Math.cos(angleInRadians)
  const s = Math.sin(angleInRadians)

  dst[4] = c * m10 + s * m20
  dst[5] = c * m11 + s * m21
  dst[6] = c * m12 + s * m22
  dst[7] = c * m13 + s * m23
  dst[8] = c * m20 - s * m10
  dst[9] = c * m21 - s * m11
  dst[10] = c * m22 - s * m12
  dst[11] = c * m23 - s * m13

  if (m !== dst) {
    dst[0] = m[0]
    dst[1] = m[1]
    dst[2] = m[2]
    dst[3] = m[3]
    dst[12] = m[12]
    dst[13] = m[13]
    dst[14] = m[14]
    dst[15] = m[15]
  }

  return dst
}

// Y轴旋转
export function yRotate(m: Mat4, angleInRadians: number, dst?: Mat4) {
  // this is the optimized version of
  // return multiply(m, yRotation(angleInRadians), dst);
  dst = dst || new Float32Array(16)

  const m00 = m[0 * 4 + 0]
  const m01 = m[0 * 4 + 1]
  const m02 = m[0 * 4 + 2]
  const m03 = m[0 * 4 + 3]
  const m20 = m[2 * 4 + 0]
  const m21 = m[2 * 4 + 1]
  const m22 = m[2 * 4 + 2]
  const m23 = m[2 * 4 + 3]
  const c = Math.cos(angleInRadians)
  const s = Math.sin(angleInRadians)

  dst[0] = c * m00 - s * m20
  dst[1] = c * m01 - s * m21
  dst[2] = c * m02 - s * m22
  dst[3] = c * m03 - s * m23
  dst[8] = c * m20 + s * m00
  dst[9] = c * m21 + s * m01
  dst[10] = c * m22 + s * m02
  dst[11] = c * m23 + s * m03

  if (m !== dst) {
    dst[4] = m[4]
    dst[5] = m[5]
    dst[6] = m[6]
    dst[7] = m[7]
    dst[12] = m[12]
    dst[13] = m[13]
    dst[14] = m[14]
    dst[15] = m[15]
  }

  return dst
}

// Z轴旋转
export function zRotate(m: Mat4, angleInRadians: number, dst?: Mat4) {
  // This is the optimized version of
  // return multiply(m, zRotation(angleInRadians), dst);
  dst = dst || new Float32Array(16)

  const m00 = m[0 * 4 + 0]
  const m01 = m[0 * 4 + 1]
  const m02 = m[0 * 4 + 2]
  const m03 = m[0 * 4 + 3]
  const m10 = m[1 * 4 + 0]
  const m11 = m[1 * 4 + 1]
  const m12 = m[1 * 4 + 2]
  const m13 = m[1 * 4 + 3]
  const c = Math.cos(angleInRadians)
  const s = Math.sin(angleInRadians)

  dst[0] = c * m00 + s * m10
  dst[1] = c * m01 + s * m11
  dst[2] = c * m02 + s * m12
  dst[3] = c * m03 + s * m13
  dst[4] = c * m10 - s * m00
  dst[5] = c * m11 - s * m01
  dst[6] = c * m12 - s * m02
  dst[7] = c * m13 - s * m03

  if (m !== dst) {
    dst[8] = m[8]
    dst[9] = m[9]
    dst[10] = m[10]
    dst[11] = m[11]
    dst[12] = m[12]
    dst[13] = m[13]
    dst[14] = m[14]
    dst[15] = m[15]
  }

  return dst
}

// 缩放
export function scale(m: Mat4, sx: number, sy: number, sz: number, dst?: Mat4) {
  // This is the optimized version of
  // return multiply(m, scaling(sx, sy, sz), dst);
  dst = dst || new Float32Array(16)

  dst[0] = sx * m[0 * 4 + 0]
  dst[1] = sx * m[0 * 4 + 1]
  dst[2] = sx * m[0 * 4 + 2]
  dst[3] = sx * m[0 * 4 + 3]
  dst[4] = sy * m[1 * 4 + 0]
  dst[5] = sy * m[1 * 4 + 1]
  dst[6] = sy * m[1 * 4 + 2]
  dst[7] = sy * m[1 * 4 + 3]
  dst[8] = sz * m[2 * 4 + 0]
  dst[9] = sz * m[2 * 4 + 1]
  dst[10] = sz * m[2 * 4 + 2]
  dst[11] = sz * m[2 * 4 + 3]

  if (m !== dst) {
    dst[12] = m[12]
    dst[13] = m[13]
    dst[14] = m[14]
    dst[15] = m[15]
  }

  return dst
}

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

export function subtractVectors(a: Vec3, b: Vec3, dst?: Vec3) {
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

export function lookAt(cameraPosition: Vec3, target: Vec3, up: Vec3, dst?: Mat4) {
  dst = dst || new Float32Array(16)
  const zAxis = normalize(subtractVectors(cameraPosition, target))
  const xAxis = normalize(cross(up, zAxis))
  const yAxis = normalize(cross(zAxis, xAxis))

  dst[0] = xAxis[0]
  dst[1] = xAxis[1]
  dst[2] = xAxis[2]
  dst[3] = 0
  dst[4] = yAxis[0]
  dst[5] = yAxis[1]
  dst[6] = yAxis[2]
  dst[7] = 0
  dst[8] = zAxis[0]
  dst[9] = zAxis[1]
  dst[10] = zAxis[2]
  dst[11] = 0
  dst[12] = cameraPosition[0]
  dst[13] = cameraPosition[1]
  dst[14] = cameraPosition[2]
  dst[15] = 1

  return dst
}

// 反转
export function inverse(m: Mat4, dst?: Mat4) {
  dst = dst || new Float32Array(16)
  const m00 = m[0 * 4 + 0]
  const m01 = m[0 * 4 + 1]
  const m02 = m[0 * 4 + 2]
  const m03 = m[0 * 4 + 3]
  const m10 = m[1 * 4 + 0]
  const m11 = m[1 * 4 + 1]
  const m12 = m[1 * 4 + 2]
  const m13 = m[1 * 4 + 3]
  const m20 = m[2 * 4 + 0]
  const m21 = m[2 * 4 + 1]
  const m22 = m[2 * 4 + 2]
  const m23 = m[2 * 4 + 3]
  const m30 = m[3 * 4 + 0]
  const m31 = m[3 * 4 + 1]
  const m32 = m[3 * 4 + 2]
  const m33 = m[3 * 4 + 3]
  const tmp_0 = m22 * m33
  const tmp_1 = m32 * m23
  const tmp_2 = m12 * m33
  const tmp_3 = m32 * m13
  const tmp_4 = m12 * m23
  const tmp_5 = m22 * m13
  const tmp_6 = m02 * m33
  const tmp_7 = m32 * m03
  const tmp_8 = m02 * m23
  const tmp_9 = m22 * m03
  const tmp_10 = m02 * m13
  const tmp_11 = m12 * m03
  const tmp_12 = m20 * m31
  const tmp_13 = m30 * m21
  const tmp_14 = m10 * m31
  const tmp_15 = m30 * m11
  const tmp_16 = m10 * m21
  const tmp_17 = m20 * m11
  const tmp_18 = m00 * m31
  const tmp_19 = m30 * m01
  const tmp_20 = m00 * m21
  const tmp_21 = m20 * m01
  const tmp_22 = m00 * m11
  const tmp_23 = m10 * m01

  const t0 = tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31 - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31)
  const t1 = tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31 - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31)
  const t2 = tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31 - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31)
  const t3 = tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21 - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21)

  const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3)

  dst[0] = d * t0
  dst[1] = d * t1
  dst[2] = d * t2
  dst[3] = d * t3
  dst[4] = d * (tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30 - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30))
  dst[5] = d * (tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30 - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30))
  dst[6] = d * (tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30 - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30))
  dst[7] = d * (tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20 - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20))
  dst[8] = d * (tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33 - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33))
  dst[9] = d * (tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33 - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33))
  dst[10] = d * (tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33 - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33))
  dst[11] = d * (tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23 - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23))
  dst[12] = d * (tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12 - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22))
  dst[13] = d * (tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22 - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02))
  dst[14] = d * (tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02 - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12))
  dst[15] = d * (tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12 - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))

  return dst
}

export function axisRotate(m: Mat4, axis: Vec3, angleInRadians: number, dst?: Mat4) {
  // This is the optimized version of
  // return multiply(m, axisRotation(axis, angleInRadians), dst);
  dst = dst || new Float32Array(16)

  let x = axis[0]
  let y = axis[1]
  let z = axis[2]
  const n = Math.sqrt(x * x + y * y + z * z)
  x /= n
  y /= n
  z /= n
  const xx = x * x
  const yy = y * y
  const zz = z * z
  const c = Math.cos(angleInRadians)
  const s = Math.sin(angleInRadians)
  const oneMinusCosine = 1 - c

  const r00 = xx + (1 - xx) * c
  const r01 = x * y * oneMinusCosine + z * s
  const r02 = x * z * oneMinusCosine - y * s
  const r10 = x * y * oneMinusCosine - z * s
  const r11 = yy + (1 - yy) * c
  const r12 = y * z * oneMinusCosine + x * s
  const r20 = x * z * oneMinusCosine + y * s
  const r21 = y * z * oneMinusCosine - x * s
  const r22 = zz + (1 - zz) * c

  const m00 = m[0]
  const m01 = m[1]
  const m02 = m[2]
  const m03 = m[3]
  const m10 = m[4]
  const m11 = m[5]
  const m12 = m[6]
  const m13 = m[7]
  const m20 = m[8]
  const m21 = m[9]
  const m22 = m[10]
  const m23 = m[11]

  dst[0] = r00 * m00 + r01 * m10 + r02 * m20
  dst[1] = r00 * m01 + r01 * m11 + r02 * m21
  dst[2] = r00 * m02 + r01 * m12 + r02 * m22
  dst[3] = r00 * m03 + r01 * m13 + r02 * m23
  dst[4] = r10 * m00 + r11 * m10 + r12 * m20
  dst[5] = r10 * m01 + r11 * m11 + r12 * m21
  dst[6] = r10 * m02 + r11 * m12 + r12 * m22
  dst[7] = r10 * m03 + r11 * m13 + r12 * m23
  dst[8] = r20 * m00 + r21 * m10 + r22 * m20
  dst[9] = r20 * m01 + r21 * m11 + r22 * m21
  dst[10] = r20 * m02 + r21 * m12 + r22 * m22
  dst[11] = r20 * m03 + r21 * m13 + r22 * m23

  if (m !== dst) {
    dst[12] = m[12]
    dst[13] = m[13]
    dst[14] = m[14]
    dst[15] = m[15]
  }

  return dst
}

// 世界坐标系 (摄像机+透视矩阵)
export function perspectiveCamera(width: number, height: number, fieldOfViewDeg = 40) {
  // 透视矩阵
  const fieldOfViewRadians = degToRad(fieldOfViewDeg)
  const aspect = width / height
  const zNear = 1
  const zFar = 20000
  const projectionMatrix = perspective(fieldOfViewRadians, aspect, zNear, zFar)

  // 相机坐标矩阵
  const zFlat = (height / Math.tan(fieldOfViewRadians * 0.5)) * 0.5
  const cameraPosition: Vec3 = [width * 0.5, -height * 0.5, zFlat]
  const target: Vec3 = [width * 0.5, -height * 0.5, 0]
  const up: Vec3 = [0, 1, 0]
  const cameraMatrix = lookAt(cameraPosition, target, up)
  // 当前视图矩阵
  const viewMatrix = inverse(cameraMatrix)
  const viewProjectionMatrix = multiply(projectionMatrix, viewMatrix)

  return viewProjectionMatrix
}

export function str$m4(m: Mat4) {
  return `ma4(
    ${m[0] + ', ' + m[1] + ', ' + m[2] + ', ' + m[3]}
    ${m[4] + ', ' + m[5] + ', ' + m[6] + ', ' + m[7]}
    ${m[8] + ', ' + m[9] + ', ' + m[10] + ', ' + m[11]}
    ${m[12] + ', ' + m[13] + ', ' + m[14] + ', ' + m[15]}
  )`
}

export function str$v3(v: Vec3) {
  return `vec3(${v[0] + ', ' + v[1] + ', ' + v[2]})`
}
