import {ThisWebGLContext} from '../base'
import {m4} from '../base'
import {FrameInfo, LayerEllipseProps, LayerPathProps, LayerRectProps, LayerShapeProps, LayerType} from '../types'
import AbstractDrawer from './AbstractDrawer'
import EllipseDrawer from './EllipseDrawer'
import Layer from './Layer'
import PathDrawer from './PathDrawer'
import RectDrawer from './RectDrawer'

export default class ShapeDrawer extends AbstractDrawer<LayerShapeProps> {
  private _subLayers?: Layer[]

  async init(gl: ThisWebGLContext) {
    this._subLayers = []
    const shapeElements = this.props.content
    if (shapeElements) {
      const width = this.props.width
      const height = this.props.height
      const inFrame = this.props.inFrame
      const outFrame = this.props.outFrame
      for (let i = shapeElements.length - 1; i >= 0; i--) {
        const element = shapeElements[i]
        let layer: Layer | null = null
        const props = {...element, inFrame, outFrame}
        if (element.type === LayerType.Rect) {
          layer = new Layer(new RectDrawer(props as LayerRectProps, this.store))
        } else if (element.type === LayerType.Ellipse) {
          layer = new Layer(new EllipseDrawer(props as LayerEllipseProps, this.store))
        } else if (element.type === LayerType.Path) {
          props.width = width
          props.height = height
          layer = new Layer(new PathDrawer(props as LayerPathProps, this.store))
        }
        if (layer) {
          await layer.init(gl)
          this._subLayers.push(layer)
        }
      }
    }
  }

  draw(gl: ThisWebGLContext, matrix: m4.Mat4, frameInfo: FrameInfo) {
    const subLayers = this._subLayers || []
    for (let i = 0, l = subLayers.length; i < l; i++) {
      const layer = subLayers[i]
      layer.render(gl, matrix, frameInfo)
    }
  }

  destroy(gl?: ThisWebGLContext | undefined) {
    super.destroy(gl)
    this._subLayers?.forEach(el => el.destroy(gl))
    this._subLayers = undefined
  }
}
