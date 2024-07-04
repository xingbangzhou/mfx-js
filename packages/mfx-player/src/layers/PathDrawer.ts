import {ThisWebGLContext} from '../base'
import {LayerPathProps} from '../types'
import ElementDrawer from './ElementDrawer'

// Notice: Path的width和height和Shape一致
export default class PathDrawer extends ElementDrawer<LayerPathProps> {
  private points: Array<[number, number]> = []

  async init(gl: ThisWebGLContext) {
    super.init(gl)

    const cx = this.width * 0.5
    const cy = this.height * 0.5
    this.points = this.props.elements.shapeInfo.points.map(el => [cx + el[0], cy + el[1]])

    this.setMatrixCache()
  }

  protected getDrawPath(ctx: OffscreenCanvasRenderingContext2D) {
    const path = new Path2D()
    const actions = this.props.elements.shapeInfo.actions
    const al = actions.length
    for (let ai = 0, pi = 0; ai < al; ai++) {
      const ac = actions[ai] || 0
      if (ac === 0) {
        const pt = this.points[pi]
        path.moveTo(pt[0], pt[1])
        pi++
      } else if (ac === 1) {
        const pt = this.points[pi]
        path.lineTo(pt[0], pt[1])
        pi++
      } else if (ac === 2) {
        const pt1 = this.points[pi]
        const pt2 = this.points[pi + 1]
        const pt3 = this.points[pi + 2]
        path.bezierCurveTo(pt1[0], pt1[1], pt2[0], pt2[1], pt3[0], pt3[1])
        pi += 3
      } else if (ac === 3) {
        const pt = this.points[this.points.length - 1]
        const pt0 = this.points[0]
        path.moveTo(pt[0], pt[1])
        path.lineTo(pt0[0], pt0[1])
      }
    }

    return path
  }
}
