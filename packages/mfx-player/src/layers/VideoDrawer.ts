import {ThisWebGLContext, drawVideo, getFillCoord, m4, FillCoord} from '../base'
import MP4Decoder, {compareMcs, DecoderStatus} from '../base/decoder/MP4Decoder'
import Texture from '../base/webgl/Texture'
import Store from '../Store'
import {FrameInfo, LayerVideoProps} from '../types'
import AbstractDrawer from './AbstractDrawer'

const MAX_DELTA_NUM = 10

export default class VideoDrawer extends AbstractDrawer<LayerVideoProps> {
  constructor(props: LayerVideoProps, store: Store, parentWidth: number, parentHeight: number) {
    super(props, store, parentWidth, parentHeight)

    this.defaultFillCoord = {
      lx: 0,
      ly: 0,
      rx: this.props.isAlpha ? 0.5 : 1.0,
      ry: 1.0,
      sw: 1.0,
      sh: 1.0,
    }
    this.fillCoord = this.defaultFillCoord
  }

  private texture?: Texture
  private videoWidth = 0
  private videoHeight = 0
  private mp4Decoder?: MP4Decoder
  private fillCoord: FillCoord
  private defaultFillCoord: FillCoord
  private syncDeltaNum?: {frameId: number; num: number}

  get url() {
    return this.store.getKeyInfo(this.props.name)?.value || this.store.getSource(this.props.id) || ''
  }
  cacheUrl: string | Blob = ''

  async init(gl: ThisWebGLContext) {
    const url = this.url
    this.cacheUrl = url

    if (url) {
      this.texture = new Texture(gl)
      const frames = this.outFrame - this.inFrame
      const endTimestamp = frames * this.store.frameTimestamp
      this.mp4Decoder = new MP4Decoder(url, endTimestamp, frames)

      // 初始化等待Ready
      this.store.addSync(this)
      this.setMatrixCache()
    }
  }

  checkSync(frameId: number) {
    // 不支持VideoDecoder
    if (!this.mp4Decoder || this.mp4Decoder.status === DecoderStatus.Error) return true
    // 视频帧未准备则
    if (this.mp4Decoder.status !== DecoderStatus.Ready) return false

    // 正常同步
    const flag = this.checkFrameId(frameId)
    // 已经同步
    if (flag) {
      this.syncDeltaNum = undefined
      return true
    }

    // 帧不一样可以重新计算
    if (frameId !== this.syncDeltaNum?.frameId) {
      this.syncDeltaNum = {frameId, num: 1}
    }
    // 判断最多延迟同步MaxSyncNum次数
    this.syncDeltaNum.num += 1
    if (this.syncDeltaNum.num >= MAX_DELTA_NUM) {
      this.syncDeltaNum = undefined
      return true
    }

    this.store.addSync(this)

    return false
  }

  async draw(gl: ThisWebGLContext, matrix: m4.Mat4, frameInfo: FrameInfo) {
    if (!this.texture || !this.mp4Decoder) return

    const width = this.width
    const height = this.height
    const timestamp = this.store.frameTimestamp * (frameInfo.frameId - this.inFrame)

    const videoFrame = this.mp4Decoder.seek(timestamp)
    if (videoFrame) {
      const videoWidth = videoFrame.codedWidth || this.videoWidth
      const videoHeight = videoFrame.codedHeight || this.videoHeight

      if (videoWidth && videoHeight && this.fillCoord !== this.defaultFillCoord) {
        this.fillCoord = getFillCoord(videoWidth, videoHeight, width, height, this.props.isAlpha, this.props.fillMode)
      }

      this.texture.texImage2D(videoFrame)
    }

    gl.activeTexture(gl.TEXTURE0)
    this.texture.bind()

    // 尺寸适配
    const {lx, ly, rx, ry, sw, sh} = this.fillCoord
    matrix = m4.translate(matrix, this.width * (1 - sw) * 0.5, -this.height * (1 - sh) * 0.5, 0)
    matrix = m4.scale(matrix, sw, sh, 1.0)

    gl.uniformMatrix4fv(gl.uniforms.matrix, false, matrix)
    gl.uniform1i(gl.uniforms.isAlpha, this.props.isAlpha ? 1 : 0)

    drawVideo(this.getAttribBuffer(gl), width, height, {lx, ly, rx, ry})

    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.uniform1i(gl.uniforms.isAlpha, 0)

    // 检测下一帧
    this.mp4Decoder.next(timestamp)
    const nextFrameId = frameInfo.frameId + 1
    if (!this.checkFrameId(nextFrameId)) {
      this.store.addSync(this)
    }
  }

  destroy() {
    super.destroy()

    this.texture?.destroy()
    this.texture = undefined
    this.mp4Decoder?.destroy()
    this.mp4Decoder = undefined
    this.syncDeltaNum = undefined
  }

  replay() {
    this.mp4Decoder?.reset()
  }

  private checkFrameId(frameId: number) {
    const mp4Decoder = this.mp4Decoder
    if (!mp4Decoder || mp4Decoder.status === DecoderStatus.Finished) return true

    const timestamp = (frameId - this.inFrame) * this.store.frameTimestamp
    const timestamp0 = mp4Decoder.timestamp0

    return compareMcs(timestamp0, timestamp) >= 0
  }
}
