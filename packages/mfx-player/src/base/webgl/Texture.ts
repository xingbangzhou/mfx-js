import {ThisWebGLContext} from './types'

export default class Texture {
  constructor(gl: ThisWebGLContext) {
    this.gl = gl

    this.handle = gl.createTexture()
    if (this.handle) {
      gl.bindTexture(gl.TEXTURE_2D, this.handle)

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

      gl.bindTexture(gl.TEXTURE_2D, null)
    }
  }

  gl: ThisWebGLContext | null = null
  handle: WebGLTexture | null = null

  bind() {
    const {gl, handle} = this
    if (!gl || !handle) return

    gl.bindTexture(gl.TEXTURE_2D, handle)
  }

  texImage2D(source: TexImageSource | null, w?: number, h?: number) {
    const {gl, handle} = this
    if (!gl || !handle) return

    gl.bindTexture(gl.TEXTURE_2D, handle)

    if (source) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
    } else if (w && h) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    }

    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  destroy() {
    this.gl?.deleteTexture(this.handle)
    this.handle = null
    this.gl = null
  }
}
