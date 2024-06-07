import {ThisWebGLContext} from './webgl'
import AttribBuffer from './webgl/AttribBuffer'

export function setRectangle(attribBuffer: AttribBuffer, x: number, y: number, w: number, h: number) {
  const x1 = 0
  const y1 = 0
  const x2 = w
  const y2 = -h
  const z = 0

  const gl = attribBuffer.gl as ThisWebGLContext

  attribBuffer.setArribInfo(gl.attribs.position, {
    size: 3,
    data: [x1, y1, z, x2, y1, z, x1, y2, z, x1, y2, z, x2, y1, z, x2, y2, z],
  })
}

// 绘制纹理矩形
export function drawTexture(attribBuffer: AttribBuffer, w: number, h: number, flipY?: boolean) {
  setRectangle(attribBuffer, 0, 0, w, h)

  const gl = attribBuffer.gl as ThisWebGLContext

  const tx1 = 0
  const ty1 = flipY ? 1 : 0
  const tx2 = 1
  const ty2 = flipY ? 0 : 1
  attribBuffer.setArribInfo(gl.attribs.texcoord, {
    data: [tx1, ty1, tx2, ty1, tx1, ty2, tx1, ty2, tx2, ty1, tx2, ty2],
  })

  const primitiveType = gl.TRIANGLES
  const count = 6
  gl.drawArrays(primitiveType, 0, count)
}

// 绘制视频纹理
export function drawVideo(
  attribBuffer: AttribBuffer,
  w: number,
  h: number,
  texcoord: {lx: number; ly: number; rx: number; ry: number},
) {
  setRectangle(attribBuffer, 0, 0, w, h)

  const gl = attribBuffer.gl as ThisWebGLContext

  const tx1 = texcoord.lx
  const ty1 = texcoord.ly
  const tx2 = texcoord.rx
  const ty2 = texcoord.ry
  attribBuffer.setArribInfo(gl.attribs.texcoord, {
    data: [tx1, ty1, tx2, ty1, tx1, ty2, tx1, ty2, tx2, ty1, tx2, ty2],
  })

  const primitiveType = gl.TRIANGLES
  const count = 6
  gl.drawArrays(primitiveType, 0, count)
}

export function drawSimpleTexture(attribBuffer: AttribBuffer) {
  const gl = attribBuffer.gl as ThisWebGLContext

  {
    const x1 = -1.0
    const y1 = -1.0
    const x2 = 1.0
    const y2 = 1.0

    const gl = attribBuffer.gl as ThisWebGLContext

    attribBuffer.setArribInfo(gl.attribs.position, {
      data: [x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2],
    })
  }

  const tx1 = 0
  const ty1 = 0
  const tx2 = 1
  const ty2 = 1
  attribBuffer.setArribInfo(gl.attribs.texcoord, {
    data: [tx1, ty1, tx2, ty1, tx1, ty2, tx1, ty2, tx2, ty1, tx2, ty2],
  })

  const primitiveType = gl.TRIANGLES
  const count = 6
  gl.drawArrays(primitiveType, 0, count)
}

export function drawLineRect(attribBuffer: AttribBuffer, w: number, h: number) {
  const x1 = 0
  const y1 = 0
  const x2 = w
  const y2 = -h
  const z = 0

  const gl = attribBuffer.gl as ThisWebGLContext

  attribBuffer.setArribInfo(gl.attribs.position, {
    size: 3,
    data: [x1, y1, z, x2, y1, z, x2, y2, z, x1, y2, z],
  })

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)

  const level = 0
  const internalFormat = gl.RGBA
  const width = 1
  const height = 1
  const border = 0
  const srcFormat = gl.RGBA
  const srcType = gl.UNSIGNED_BYTE
  const pixel = new Uint8Array([255, 0, 0, 255]) // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel)

  const tx1 = 0
  const ty1 = 0
  const tx2 = 1
  const ty2 = 1
  attribBuffer.setArribInfo(gl.attribs.texcoord, {
    data: [tx1, ty1, tx2, ty1, tx1, ty2, tx1, ty2, tx2, ty1, tx2, ty2],
  })

  const primitiveType = gl.LINE_LOOP
  const count = 4
  gl.drawArrays(primitiveType, 0, count)
}
