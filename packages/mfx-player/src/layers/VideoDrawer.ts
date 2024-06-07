import {ThisWebGLContext, drawLineRect, drawVideo, getFillCoord, m4} from '../base'
import MP4Decoder from '../base/decoder/MP4Decoder'
import Texture from '../base/webgl/Texture'
import {FrameInfo, LayerVideoProps} from '../types'
import AbstractDrawer from './AbstractDrawer'

export default class VideoDrawer extends AbstractDrawer<LayerVideoProps> {
  private texture?: Texture
  private videoWidth = 0
  private videoHeigt = 0
  private decoder?: MP4Decoder

  get url() {
    return this.props.content || ''
  }

  async init(gl: ThisWebGLContext) {
    this.store.addKeyInfo(this.props)

    this.texture = new Texture(gl)
    this.decoder = new MP4Decoder(this.url)
  }

  async draw(gl: ThisWebGLContext, matrix: m4.Mat4, frameInfo: FrameInfo) {
    if (!this.texture || !this.decoder) return

    const time = (frameInfo.frameId - this.inFrame) * this.store.frameTime
    this.decoder.seek(time)
    const videoFrame = this.decoder.videoFrame
    if (videoFrame) {
      this.texture.texImage2D(videoFrame)
      this.videoWidth = videoFrame.codedWidth
      this.videoHeigt = videoFrame.codedHeight
    }
    this.decoder.next()

    gl.activeTexture(gl.TEXTURE0)
    this.texture.bind()

    const width = this.width
    const height = this.height
    const {lx, ly, rx, ry, sw, sh} = getFillCoord(
      this.videoWidth,
      this.videoHeigt,
      width,
      height,
      this.props.isAlpha,
      this.props.fillMode,
    )

    matrix = m4.translate(matrix, this.width * (1 - sw) * 0.5, -this.height * (1 - sh) * 0.5, 0)
    matrix = m4.scale(matrix, sw, sh, 1.0)
    gl.uniformMatrix4fv(gl.uniforms.matrix, false, matrix)
    gl.uniform1i(gl.uniforms.isAlpha, this.props.isAlpha ? 1 : 0)

    drawVideo(this.getAttribBuffer(gl), width, height, {lx, ly, rx, ry})

    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.uniform1i(gl.uniforms.isAlpha, 0)
  }

  destroy(gl?: ThisWebGLContext | undefined) {
    super.destroy(gl)
    this.texture?.destroy()
    this.texture = undefined
    this.decoder?.destroy()
    this.decoder = undefined
  }
}
