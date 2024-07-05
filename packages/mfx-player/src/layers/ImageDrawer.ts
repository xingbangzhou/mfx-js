import {ThisWebGLContext, drawTexture, m4} from '../base'
import {FrameInfo, LayerImageProps} from '../types'
import AbstractDrawer from './AbstractDrawer'
import Texture from '../base/webgl/Texture'

const loadImageData = async (url: string): Promise<Blob | undefined> => {
  return new Promise<any>(resolve => {
    fetch(url)
      .then(response => {
        return response.blob()
      })
      .catch(err => {
        console.log(err)
      })
      .then(blob => {
        resolve(blob)
      })
  })
}

export default class ImageDrawer extends AbstractDrawer<LayerImageProps> {
  private texture?: Texture

  get url(): Blob | string {
    return this.store.getKeyInfo(this.props.name)?.value || this.store.getSource(this.props.id) || ''
  }
  cacheUrl: string | Blob = ''

  async init(gl: ThisWebGLContext) {
    const url = this.url
    this.cacheUrl = url

    if (url) {
      let imageData: Blob | undefined = undefined
      if (typeof url === 'string') {
        imageData = await loadImageData(url)
      } else if (url instanceof Blob) {
        imageData = url
      }

      if (imageData) {
        createImageBitmap(imageData)
          .then(imageBitmap => {
            const imageWidth = imageBitmap.width
            const imageHeight = imageBitmap.height
            const width = this.width
            const height = this.height
            let canvas: OffscreenCanvas | null = new OffscreenCanvas(width, height)
            let ctx: OffscreenCanvasRenderingContext2D | null = canvas.getContext('2d')
            if (this.props.fillMode === 1) {
              // 长边对齐
              const isLead = this.width / this.height < imageWidth / imageHeight
              const drawWidth = !isLead ? this.width : this.height * (imageWidth / imageHeight)
              const drawHeight = isLead ? this.height : this.width / (imageWidth / imageHeight)
              const drawX = -(drawWidth - this.width) / 2
              const drawY = -(drawHeight - this.height) / 2
              ctx?.drawImage(imageBitmap, drawX, drawY, drawWidth, drawHeight)
            } else if (this.props.fillMode === 2) {
              // 平铺填充
              ctx?.drawImage(imageBitmap, 0, 0, this.width, this.height)
            } else {
              // 短边对齐
              const isLead = this.width / this.height < imageWidth / imageHeight
              const drawWidth = isLead ? this.width : this.height * (imageWidth / imageHeight)
              const drawHeight = !isLead ? this.height : this.width / (imageWidth / imageHeight)
              const drawX = (this.width - drawWidth) / 2
              const drawY = (this.height - drawHeight) / 2
              ctx?.drawImage(imageBitmap, drawX, drawY, drawWidth, drawHeight)
            }
            this.texture = new Texture(gl)
            this.texture.texImage2D(canvas as any)

            imageBitmap.close()
            ctx = null
            canvas = null
            this.cacheUrl = url
            this.setMatrixCache()
          })
          .catch(err => {
            console.error('createImageBitmap', String(err), url)
          })
      }
    }
  }

  draw(gl: ThisWebGLContext, matrix: m4.Mat4, frameInfo: FrameInfo) {
    if (!this.texture) return

    gl.activeTexture(gl.TEXTURE0)
    this.texture.bind()
    gl.uniformMatrix4fv(gl.uniforms.matrix, false, matrix)

    drawTexture(this.getAttribBuffer(gl), this.width, this.height)
  }

  destroy() {
    super.destroy()

    this.texture?.destroy()
    this.texture = undefined
  }
}
