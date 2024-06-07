import RenderStore from '../render/RenderStore'
import {ThisWebGLContext, degToRad, m4} from '../base'
import {Transform3D} from '../base/transforms'
import AttribBuffer from '../base/webgl/AttribBuffer'
import {BlendMode, FrameInfo, LayerProps, TrackMatteType} from '../types'

export default abstract class AbstractDrawer<Props extends LayerProps> {
  constructor(props: Props, store: RenderStore) {
    this.store = store
    this.props = props
    this.transform = new Transform3D(props.transform)
  }

  readonly store: RenderStore
  readonly props: Props
  readonly transform: Transform3D

  protected offXY = [0, 0]
  protected anchorOffXY = [0, 0]

  private _attribBuffer?: AttribBuffer

  get type() {
    return this.props.type
  }

  get width() {
    return this.props.width
  }

  get height() {
    return this.props.height
  }

  get inFrame() {
    return this.props.inFrame
  }

  get outFrame() {
    return this.props.outFrame
  }

  get blendMode() {
    return this.props.blendMode || BlendMode.None
  }

  get trackMatteType() {
    return this.props.trackMatteType || TrackMatteType.None
  }

  setOffXY(x = 0, y = 0) {
    this.offXY = [x, y]
  }

  setAnchorOffXY(x = 0, y = 0) {
    this.anchorOffXY = [x, y]
  }

  getMatrix({frameId}: FrameInfo) {
    const anchorPoint = this.transform.getAnchorPoint(frameId, this.anchorOffXY[0], this.anchorOffXY[1])
    const position = this.transform.getPosition(frameId, this.offXY[0], this.offXY[1])
    const scale = this.transform.getScale(frameId)
    const rotation = this.transform.getRotation(frameId)
    const orientation = this.transform.getOrientation(frameId)

    if (!anchorPoint || !position) return null

    // 位移
    const [x, y, z] = position
    let matrix = m4.translation(x, -y, -z)
    // 朝向
    if (rotation[0]) {
      matrix = m4.xRotate(matrix, degToRad(rotation[0]))
    }
    if (rotation[1]) {
      matrix = m4.yRotate(matrix, degToRad(360 - rotation[1]))
    }
    if (rotation[2]) {
      matrix = m4.zRotate(matrix, degToRad(360 - rotation[2]))
    }
    if (orientation[0]) {
      matrix = m4.xRotate(matrix, degToRad(orientation[0]))
    }
    if (orientation[1]) {
      matrix = m4.yRotate(matrix, degToRad(360 - orientation[1]))
    }
    if (orientation[2]) {
      matrix = m4.zRotate(matrix, degToRad(360 - orientation[2]))
    }
    // 旋转
    if (scale) {
      matrix = m4.scale(matrix, (scale[0] || 100) * 0.01, (scale[1] || 100) * 0.01, (scale[2] || 100) * 0.01)
    }
    // 锚点
    const moveOrighMatrix = m4.translation(-anchorPoint[0], anchorPoint[1], 0)
    matrix = m4.multiply(matrix, moveOrighMatrix)

    return matrix
  }

  // 0 ~ 1.0
  getOpacity({frameId, opacity}: FrameInfo) {
    return this.transform.getOpacity(frameId) * opacity
  }

  getAttribBuffer(gl: ThisWebGLContext) {
    if (!this._attribBuffer) {
      this._attribBuffer = new AttribBuffer(gl)
    }
    return this._attribBuffer
  }

  abstract init(gl: ThisWebGLContext): Promise<void>

  abstract draw(gl: ThisWebGLContext, matrix: m4.Mat4, frameInfo: FrameInfo): void

  destroy(gl?: ThisWebGLContext) {
    this._attribBuffer?.destroy()
    this._attribBuffer = undefined
  }
}
