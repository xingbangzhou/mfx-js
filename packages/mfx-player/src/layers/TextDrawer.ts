import {ThisWebGLContext, drawTexture, m4, rgba} from '../base'
import Texture from '../base/webgl/Texture'
import {FrameInfo, LayerTextProps} from '../types'
import AbstractDrawer from './AbstractDrawer'

const alignMap: CanvasTextAlign[] = ['left', 'center', 'right', 'left', 'left', 'left', 'left', 'left']

function drawHorizText(
  ctx: OffscreenCanvasRenderingContext2D,
  text: string,
  textDocAttr: LayerTextProps['textDocAttr'],
) {
  // 设置字体
  ctx.font = `${textDocAttr.fontSize || 24}px ${textDocAttr.fontFamily || 'Arial'}`

  const metrics = ctx.measureText(text)
  const width = metrics.width
  const height = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent

  ctx.canvas.width = width
  ctx.canvas.height = height

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // 设置字体
  ctx.fillStyle = rgba(textDocAttr.textColor)
  ctx.font = `${textDocAttr.fauxBold ? 'bold' : 'normal'} ${textDocAttr.fontSize || 24}px ${
    textDocAttr.fontFamily || 'Arial'
  }`

  ctx.fillText(text, width * 0.5, height * 0.5)
}

function drawVertiText(
  ctx: OffscreenCanvasRenderingContext2D,
  text: string,
  textDocAttr: LayerTextProps['textDocAttr'],
) {
  // 设置字体
  ctx.font = `${textDocAttr.fontSize || 24}px ${textDocAttr.fontFamily || 'Arial'}`
  const metrics = ctx.measureText('国')
  const width = metrics.width
  const fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent

  ctx.canvas.width = width
  ctx.canvas.height = fontHeight * text.length

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // 设置字体
  ctx.fillStyle = rgba(textDocAttr.textColor)
  ctx.font = `${textDocAttr.fauxBold ? 'bold' : 'normal'} ${textDocAttr.fontSize || 24}px ${
    textDocAttr.fontFamily || 'Arial'
  }`

  const x = width * 0.5
  let y = -fontHeight * 0.5
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], x, y + fontHeight)
    y += fontHeight
  }
}

export default class TextDrawer extends AbstractDrawer<LayerTextProps> {
  private texture?: Texture

  get text() {
    return this.store.getKeyInfo(this.props.name)?.value || this.props.textDocAttr.text || ''
  }
  cacheText = ''

  async init(gl: ThisWebGLContext) {
    const text = this.text
    this.cacheText = text

    const canvas = new OffscreenCanvas(0, 0)
    let ctx = canvas.getContext('2d')
    if (ctx && this.props.textDocAttr) {
      const textDocAttr = this.props.textDocAttr
      // 横向画字
      if (textDocAttr.orientation) {
        drawVertiText(ctx, text, textDocAttr)
        // 此处记住锚点偏移
        if (textDocAttr.textAligment !== undefined) {
          const align = alignMap[textDocAttr.textAligment]
          if (align === 'left') {
            this.setAnchorOffXY(canvas.width * 0.5, 0)
          } else if (align === 'center') {
            this.setAnchorOffXY(canvas.width * 0.5, canvas.height * 0.5)
          } else {
            this.setAnchorOffXY(canvas.width * 0.5, canvas.height)
          }
        }
      } else {
        // 水平画字
        drawHorizText(ctx, text, textDocAttr)
        if (textDocAttr.textAligment !== undefined) {
          const align = alignMap[textDocAttr.textAligment]
          if (align === 'left') {
            this.setAnchorOffXY(0, canvas.height)
          } else if (align === 'center') {
            this.setAnchorOffXY(canvas.width * 0.5, canvas.height)
          } else {
            this.setAnchorOffXY(canvas.width, canvas.height)
          }
        }
      }

      // 指定宽高
      this.props.width = canvas.width
      this.props.height = canvas.height
      // 生成纹理
      this.texture = new Texture(gl)
      this.texture.texImage2D(canvas)
    }
    // 清理
    ctx = null
  }

  async draw(gl: ThisWebGLContext, matrix: m4.Mat4, frameInfo: FrameInfo) {
    if (!this.texture) return

    gl.activeTexture(gl.TEXTURE0)
    this.texture.bind()
    gl.uniformMatrix4fv(gl.uniforms.matrix, false, matrix)

    const width = this.width
    const height = this.height
    drawTexture(this.getAttribBuffer(gl), width, height)

    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  destroy() {
    super.destroy()

    this.texture?.destroy()
    this.texture = undefined
  }
}
