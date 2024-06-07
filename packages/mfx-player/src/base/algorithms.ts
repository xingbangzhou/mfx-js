export function degToRad(d: number) {
  return (d * Math.PI) / 180
}

// color：0~1， opacity: 0~100 默认100
export function rgba(color: number[], opacity?: number) {
  opacity = opacity ?? 100
  color[0] = color[0] || 0
  color[1] = color[1] || 0
  color[2] = color[2] || 0
  color[3] = color[3] ?? 1
  return `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${color[3] * opacity * 0.01})`
}

export interface FillCoord {
  lx: number
  ly: number
  rx: number
  ry: number
  sw: number
  sh: number
}

export function getFillCoord(
  srcw: number,
  srch: number,
  dstw: number,
  dsth: number,
  alPha?: boolean,
  fillMode?: number,
): FillCoord {
  let lx = 0
  let ly = 0
  let rx = alPha ? 0.5 : 1.0
  let ry = 1.0
  let sw = 1.0
  let sh = 1.0

  const srcW = alPha ? srcw * 0.5 : srcw
  const srcH = srch
  if (fillMode === 1) {
    const srcWhr = srcW / srcH
    const dstWhr = dstw / dsth
    const isLead = dstWhr < srcWhr
    const tw = isLead ? dsth * srcWhr : dstw
    const th = isLead ? dsth : dstw / srcWhr
    lx = (dstw - tw) * 0.5
    ly = (dsth - th) * 0.5
    lx = -lx / srcw
    ly = -ly / th
    rx = rx - lx
    ry = ry - ly
  } else if (fillMode === 2) {
    // 默认拉伸
  } else {
    const srcWhr = srcW / srcH
    const dstWhr = dstw / dsth
    const isLead = dstWhr < srcWhr
    const tw = isLead ? dstw : dsth * srcWhr
    const th = isLead ? dstw / srcWhr : dsth
    sw = tw / dstw
    sh = th / dsth
  }

  return {lx, ly, rx, ry, sw, sh}
}
