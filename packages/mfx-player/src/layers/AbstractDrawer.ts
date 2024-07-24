import Store from '../render/Store'
import {ThisWebGLContext, degToRad, m4} from '../base'
import {Transform3D} from '../base/transforms'
import AttribBuffer from '../base/webgl/AttribBuffer'
import {BlendMode, FrameInfo, LayerProps, TrackMatteType} from '../types'

export default abstract class AbstractDrawer<Props extends LayerProps> {
  constructor(props: Props, store: Store, parentWidth: number, parentHeight: number) {
    this.store = store
    this.props = props
    this.transform = new Transform3D(props.transform)
    this.parentWidth = parentWidth
    this.parentHeight = parentHeight

    this._matrixCache = new Array(props.outFrame)
  }

  readonly store: Store
  readonly props: Props
  readonly transform: Transform3D
  readonly parentWidth: number
  readonly parentHeight: number

  protected offX = 0
  protected offY = 0
  protected anchorOffX = 0
  protected anchorOffY = 0

  private _attribBuffer?: AttribBuffer
  private _matrixCache: (m4.Mat4 | null)[]

  get id() {
    return this.props.id
  }

  get name() {
    return this.props.name
  }

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
    this.offX = x
    this.offY = y
  }

  setAnchorOffXY(x = 0, y = 0) {
    this.anchorOffX = x
    this.anchorOffY = y
  }

  getMatrix(frameId: number) {
    let matrix = this._matrixCache[frameId]
    if (!matrix) {
      matrix = this.getFrameMatrix(frameId)
    }
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

  destroy() {
    this._attribBuffer?.destroy()
    this._attribBuffer = undefined

    this.store.removeSync(this)
  }

  checkSync(frameId: number) {
    return true
  }

  protected setMatrixCache() {
    const l = this.outFrame
    for (let i = 0; i < l; i++) {
      this._matrixCache[i] = this.getFrameMatrix(i)
    }
  }

  private getFrameMatrix(frameId: number) {
    const anchorPoint = this.transform.getAnchorPoint(frameId, this.anchorOffX, this.anchorOffY)
    const position = this.transform.getPosition(frameId, this.offX, this.offY)
    const scale = this.transform.getScale(frameId)
    const rotation = this.transform.getRotation(frameId)
    const orientation = this.transform.getOrientation(frameId)

    if (!anchorPoint || !position) return null

    const cx = this.parentWidth * 0.5
    const cy = this.parentHeight * 0.5

    // 位移
    const [x, y, z] = position
    let matrix = m4.translation(x - cx, cy - y, -z)
    // 轴旋转
    const rx = rotation[0]
    const ry = rotation[1]
    const rz = rotation[2]
    if (rx % 360) {
      matrix = m4.multiply(matrix, m4.rotationX(degToRad(rx)))
    }
    if (ry % 360) {
      matrix = m4.multiply(matrix, m4.rotationY(degToRad(360 - ry)))
    }
    if (rz % 360) {
      matrix = m4.multiply(matrix, m4.rotationZ(degToRad(360 - rz)))
    }
    // 方向旋转
    const ox = orientation[0]
    const oy = orientation[1]
    const oz = orientation[2]
    if (ox % 360) {
      matrix = m4.multiply(matrix, m4.rotationX(degToRad(ox)))
    }
    if (oy % 360) {
      matrix = m4.multiply(matrix, m4.rotationY(degToRad(360 - oy)))
    }
    if (oz % 360) {
      matrix = m4.multiply(matrix, m4.rotationZ(degToRad(360 - oz)))
    }
    // 缩放
    if (scale) {
      const [sx, sy, sz] = scale
      if (sx % 100 || sy % 100 || sz % 100) {
        matrix = m4.scale(matrix, sx * 0.01, sy * 0.01, sz * 0.01)
      }
    }
    // 锚点
    const moveOrighMatrix = m4.translation(-anchorPoint[0], anchorPoint[1], 0)
    matrix = m4.multiply(matrix, moveOrighMatrix)

    return matrix
  }
}
