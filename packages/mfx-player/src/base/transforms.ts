import {TransformProps} from '../types'
import {Vec3} from './m4'

export class Property<T = number[] | number> {
  constructor(data: {inFrame: number; value: T}[]) {
    this.data = data
  }

  readonly data: {inFrame: number; value: T}[]

  getValue(frameId: number) {
    if (!this.data.length) return null
    if (frameId < this.data[0].inFrame) return null

    const l = this.data.length
    let idx = 0
    for (let i = 0, l = this.data.length; i < l; i++) {
      const temp = this.data[i]
      if (temp.inFrame === frameId) return temp.value
      if (temp.inFrame > frameId) break
      idx = i
    }
    if (idx === l - 1) {
      return this.data[l - 1].value
    }
    // 计算
    const lhs = this.data[idx]
    const rhs = this.data[idx + 1]

    const fas = (frameId - lhs.inFrame) / (rhs.inFrame - lhs.inFrame)

    if (typeof lhs.value === 'number') {
      return lhs.value + ((rhs.value as number) - lhs.value) * fas
    }

    const larr = lhs.value as number[]
    const rarr = rhs.value as number[]

    return larr.map((lvalue, index) => {
      return lvalue + ((rarr[index] as number) - lvalue) * fas
    })
  }
}

export class Transform3D {
  constructor(props: TransformProps) {
    this.anchorPoint = new Property<number[]>(props.anchorPoint)
    this.position = new Property<number[]>(props.position)

    this.scale = new Property<number[]>(props.scale)

    this.opacity = new Property<number>(props.opacity)

    this.rotationX = props.rotationX ? new Property<number>(props.rotationX) : undefined
    this.rotationY = props.rotationY ? new Property<number>(props.rotationY) : undefined
    this.rotationZ = props.rotationZ ? new Property<number>(props.rotationZ) : undefined
    this.orientation = props.orientation ? new Property<number[]>(props.orientation) : undefined
  }

  // 锚点
  anchorPoint?: Property<number[]>
  // 位置
  position?: Property<number[]>
  // 缩放
  scale?: Property<number[]>
  // 透明度
  opacity?: Property<number>
  // 旋转
  rotationX?: Property<number>
  // 旋转
  rotationY?: Property<number>
  // 旋转
  rotationZ?: Property<number>
  // 朝向
  orientation?: Property<number[]>

  getAnchorPoint(frameId: number, offX = 0, offY = 0) {
    if (!this.anchorPoint) return null

    const value = this.anchorPoint.getValue(frameId) as number[] | null
    if (!value) return null

    const x = value[0] || 0
    const y = value[1] || 0
    const z = value[1] || 0

    return [x + offX, y + offY, z] as Vec3
  }

  getPosition(frameId: number, offX = 0, offY = 0) {
    if (!this.position) return null

    const value = this.position.getValue(frameId) as number[] | null
    if (!value) return null

    const x = value[0] || 0
    const y = value[1] || 0
    const z = value[2] || 0

    return [x + offX, y + offY, z] as Vec3
  }

  getScale(frameId: number) {
    return this.scale?.getValue(frameId) as Vec3
  }

  getOpacity(frameId: number) {
    return ((this.opacity?.getValue(frameId) ?? 100) as number) * 0.01
  }

  getRotation(frameId: number) {
    const x = this.rotationX?.getValue(frameId) || 0
    const y = this.rotationY?.getValue(frameId) || 0
    const z = this.rotationZ?.getValue(frameId) || 0

    return [x, y, z] as Vec3
  }

  getOrientation(frameId: number) {
    if (!this.orientation) return [0, 0, 0] as Vec3

    return this.orientation?.getValue(frameId) as Vec3
  }
}
