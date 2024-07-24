import {degToRad, m4, v3} from '../base'
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
    this.outFrame = props.outFrame

    this._matrixCache = new Array(props.outFrame)
    this.setMatrixCache()
  }

  readonly transform: Transform3D
  readonly zoomProp?: Property<number>
  readonly width: number
  readonly height: number
  readonly outFrame: number

  private _matrixCache: (m4.Mat4 | null)[]

  getMatrix(frameId: number) {
    let matrix = this._matrixCache[frameId]
    if (!matrix) {
      matrix = this.getFrameMatrix(frameId)
    }
    return matrix
  }

  private setMatrixCache() {
    const l = this.outFrame
    for (let i = 0; i < l; i++) {
      this._matrixCache[i] = this.getFrameMatrix(i)
    }
  }

  private getFrameMatrix(frameId: number) {
    const zoom = this.zoomProp?.getValue(frameId) as number | undefined
    if (!zoom) return null

    const position = this.transform.getPosition(frameId) || [0, 0, 0]
    const anchorPoint = this.transform.getAnchorPoint(frameId) || [0, 0, 0]
    const rotation = this.transform.getRotation(frameId)
    const orientation = this.transform.getOrientation(frameId)

    const width = this.width
    const height = this.height
    const cw = width * 0.5
    const ch = height * 0.5

    // 透视矩阵
    const fieldOfViewRadians = Math.atan(ch / zoom) * 2
    const aspect = width / height
    const zNear = 1
    const zFar = 20000
    const perspectiveMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar)

    // 相机向量和左边信息
    const cameraPosition: v3.Vec3 = [position[0] - cw, ch - position[1], -position[2]]
    const target: v3.Vec3 = [anchorPoint[0] - cw, ch - anchorPoint[1], -anchorPoint[2]]
    const up: v3.Vec3 = [0, 1, 0]
    let zAxis = v3.subtract(cameraPosition, target)
    let xAxis = v3.cross(up, zAxis)
    let yAxis = v3.cross(zAxis, xAxis)
    // 方向旋转
    const ox = orientation[0]
    const oy = orientation[1]
    const oz = orientation[2]
    if (ox % 360) {
      yAxis = m4.transformMat4(m4.axisRotation(xAxis, degToRad(ox)), yAxis)
      zAxis = v3.cross(xAxis, yAxis)
    }
    if (oy % 360) {
      xAxis = m4.transformMat4(m4.axisRotation(yAxis, degToRad(360 - oy)), xAxis)
      zAxis = v3.cross(xAxis, yAxis)
    }
    if (oz % 360) {
      xAxis = m4.transformMat4(m4.axisRotation(zAxis, degToRad(360 - oz)), xAxis)
      yAxis = v3.cross(zAxis, xAxis)
    }
    // 轴旋转
    const rx = rotation[0]
    const ry = rotation[1]
    const rz = rotation[2]
    if (rx % 360) {
      yAxis = m4.transformMat4(m4.axisRotation(xAxis, degToRad(rx)), yAxis)
      zAxis = v3.cross(xAxis, yAxis)
    }
    if (ry % 360) {
      xAxis = m4.transformMat4(m4.axisRotation(yAxis, degToRad(360 - ry)), xAxis)
      zAxis = v3.cross(xAxis, yAxis)
    }
    if (rz % 360) {
      xAxis = m4.transformMat4(m4.axisRotation(zAxis, degToRad(360 - rz)), xAxis)
      yAxis = v3.cross(zAxis, xAxis)
    }

    let cameraMatrix = m4.axisLookAt(cameraPosition, xAxis, yAxis, zAxis)
    cameraMatrix = m4.inverse(cameraMatrix)
    cameraMatrix = m4.multiply(perspectiveMatrix, cameraMatrix)

    return cameraMatrix
  }
}
