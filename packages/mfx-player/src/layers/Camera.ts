import {identity, inverse, lookAt, multiply, perspective, Vec3} from '../base/m4'
import {Property, Transform3D} from '../base/transforms'
import {LayerCameraProps} from '../types'

export default class Camera {
  constructor(props: LayerCameraProps, width: number, height: number) {
    this.transform = new Transform3D(props.transform)
    if (props.options?.zoom) {
      this.zoomProp = new Property<number>(props.options.zoom)
    }
    this.width = width
    this.height = height
  }

  readonly transform: Transform3D
  readonly zoomProp?: Property<number>
  readonly width: number
  readonly height: number

  private _frameId = -1
  private _matrix = identity()

  getMatrix(frameId: number) {
    if (!this.zoomProp) return undefined
    if (frameId === this._frameId) return this._matrix

    this._frameId = frameId

    const zoom = this.zoomProp.getValue(frameId) as number
    const anchorPoint = this.transform.getAnchorPoint(frameId)
    const position = this.transform.getPosition(frameId)
    const [ax, ay, az] = anchorPoint || [0, 0, 0]
    const [px, py, pz] = position || [0, 0, 0]

    const fieldOfViewRadians = Math.atan((this.height * 0.5) / zoom) * 2
    const aspect = this.width / this.height
    const zNear = 1
    const zFar = 20000
    const projectionMatrix = perspective(fieldOfViewRadians, aspect, zNear, zFar)

    const cx = this.width * 0.5
    const cy = this.height * 0.5

    const cameraPosition: Vec3 = [px - cx, cy - py, -pz]
    const target: Vec3 = [ax - cx, cy - ay, -az]
    const up: Vec3 = [0, 1, 0]
    const cameraMatrix = lookAt(cameraPosition, target, up)
    // 当前视图矩阵
    const viewMatrix = inverse(cameraMatrix)
    this._matrix = multiply(projectionMatrix, viewMatrix)

    return this._matrix
  }
}
