import Texture from './Texture'
import {ThisWebGLContext} from './types'

export default class Framebuffer {
  constructor(gl: ThisWebGLContext) {
    this.gl = gl
    this.reset()
  }

  gl?: ThisWebGLContext
  buffer: WebGLFramebuffer | null = null
  texture?: Texture
  private w?: number
  private h?: number

  bind() {
    const gl = this.gl
    gl?.bindFramebuffer(gl.FRAMEBUFFER, this.buffer)
  }

  viewport(w: number, h: number, noClr?: boolean) {
    const gl = this.gl

    if (w !== this.w || h !== this.h) {
      this.w = w
      this.h = h
      this.texture?.texImage2D(null, w, h)
    }

    gl?.viewport(0, 0, w, h)
    if (!noClr) {
      gl?.clear(gl.COLOR_BUFFER_BIT)
    }
  }

  reset() {
    const texture = this.texture
    const gl = this.gl

    if (gl) {
      this.buffer && gl.deleteFramebuffer(this.buffer)

      this.buffer = gl.createFramebuffer()
      this.texture = new Texture(gl)

      gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffer)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture.handle, 0)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)

      this.w = undefined
      this.h = undefined
    }

    return texture
  }

  destory() {
    this.gl?.deleteFramebuffer(this.buffer)
    this.buffer = null
    this.texture?.destroy()
    this.texture = undefined
    this.gl = undefined
  }
}
