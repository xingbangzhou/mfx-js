import {ThisWebGLContext, drawTexture, m4} from '../base'
import Texture from '../base/webgl/Texture'
import {FrameInfo, LayerImageProps} from '../types'
import AbstractDrawer from './AbstractDrawer'

const loadImageData = async (url: string) => {
  return new Promise<any>(resolve => {
    fetch(url)
      .then(response => {
        return response.blob()
      })
      .then(blob => {
        resolve(blob)
      })
  })
}

export default class ImageDrawer extends AbstractDrawer<LayerImageProps> {
  private texture?: Texture

  get url() {
    return this.props.content || ''
  }

  async init(gl: ThisWebGLContext) {
    this.store.addKeyInfo(this.props)

    const imageData = await loadImageData(this.url)
    if (imageData) {
      createImageBitmap(imageData).then(imageBitmap => {
        const width = this.width
        const height = this.height
        const canvas = new OffscreenCanvas(width, height)
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(imageBitmap, 0, 0)

          this.texture = new Texture(gl)
          this.texture.texImage2D(canvas)
        }
      })
    }
  }

  async draw(gl: ThisWebGLContext, matrix: m4.Mat4, frameInfo: FrameInfo) {
    if (!this.texture) return

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.activeTexture(gl.TEXTURE0)
    this.texture.bind()
    gl.uniformMatrix4fv(gl.uniforms.matrix, false, matrix)

    const width = this.width
    const height = this.height
    drawTexture(this.getAttribBuffer(gl), width, height)

    gl.bindTexture(gl.TEXTURE_2D, null)

    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  }

  destroy(gl?: ThisWebGLContext | undefined) {
    super.destroy(gl)
    this.texture?.destroy()
    this.texture = undefined
  }
}
