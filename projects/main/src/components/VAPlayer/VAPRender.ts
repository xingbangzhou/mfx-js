import {createProgram, createShader} from 'src/utils/glFns'
import {VAPOptions} from './types'
import VAPCore from './VAPCore'

export default class VAPRender extends VAPCore {
  constructor(opts: VAPOptions) {
    super(opts)

    if (this.useFrameCallback) {
      this.animId = this.video?.['requestVideoFrameCallback'](this.drawFrame.bind(this))
    }

    this.init()
  }

  private canvas!: HTMLCanvasElement
  private gl?: WebGLRenderingContext
  private program?: WebGLProgram
  private textures?: WebGLTexture[]

  clear() {
    const {gl, canvas} = this

    if (this.textures && this.textures.length) {
      for (let i = 0; i < this.textures.length; i++) {
        gl?.deleteTexture(this.textures[i])
      }
    }

    canvas.parentNode && canvas.parentNode.removeChild(canvas)
  }

  private init() {
    this.createCanvas()
    this.initWebGL()
    this.play()
  }

  private createCanvas() {
    const {video} = this
    this.canvas = document.createElement('canvas')
    this.canvas.width = video ? Math.floor(video.videoWidth * 0.5) : 9
    this.canvas.height = video?.videoHeight || 0
    this.container.appendChild(this.canvas)
  }

  protected onLoadedData() {
    const {gl, canvas, video} = this
    if (!gl || !canvas || !video) return

    canvas.width = Math.floor(video.videoWidth * 0.5)
    canvas.height = video.videoHeight
    gl.viewport(0, 0, canvas.width, canvas.height)
  }

  private initWebGL() {
    const {canvas} = this
    const gl = (this.gl = canvas.getContext('webgl') || undefined)
    if (!gl) {
      console.error("[VideoRender] getContext('webgl')", 'null')
      return
    }
    // Initial Setting
    this.initSetting()
    // Initial Program
    this.initProgram()

    // Initial Buffers
    this.initBuffer()

    // Initial Textures
    this.initTexture()
  }

  private createVertexShader() {
    const {gl} = this
    if (!gl) return undefined

    return createShader(
      gl,
      gl.VERTEX_SHADER,
      `
      attribute vec2 a_position; // 接受顶点坐标
      attribute vec2 a_texCoord; // 接受纹理坐标
      varying vec2 v_texCoord; // 传递纹理坐标给片元着色器

      void main(void) {
        gl_Position = vec4(a_position, 0.0, 1.0); // 设置坐标
        v_texCoord = a_texCoord; // 设置纹理坐标
      }
      `,
    )
  }

  private createFragmentShader() {
    const {gl} = this
    if (!gl) return undefined

    const fragmentSharder = `
        precision lowp float;
        varying vec2 v_texCoord;
        uniform sampler2D u_image_video;

        void main(void) {
          gl_FragColor = vec4(texture2D(u_image_video, v_texCoord).rgb, texture2D(u_image_video, v_texCoord+vec2(0.5, 0)).r);
        }
        `
    return createShader(gl, gl.FRAGMENT_SHADER, fragmentSharder)
  }

  private initSetting() {
    const {gl, canvas} = this
    if (!gl || !canvas) return

    gl.disable(gl.BLEND)
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  private initProgram() {
    const {gl, canvas} = this
    if (!gl || !canvas) return

    const vertexShader = this.createVertexShader() as WebGLShader
    const fragmentShader = this.createFragmentShader() as WebGLShader
    this.program = createProgram(gl, vertexShader, fragmentShader)
  }

  private initBuffer() {
    const {gl, program} = this
    if (!gl || !program) return

    // Position Buffer
    const positionVertice = new Float32Array([-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0])
    const positionBuffer = gl.createBuffer()
    const aPosition = gl.getAttribLocation(program, 'a_position')
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positionVertice, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

    // Texture Buffer
    const textureBuffer = gl.createBuffer()
    const textureVertice = new Float32Array([0.0, 1.0, 0.5, 1.0, 0.0, 0.0, 0.5, 0.0])
    const aTexCoord = gl.getAttribLocation(program, 'a_texCoord')
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, textureVertice, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(aTexCoord)
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0)
  }

  private initTexture() {
    const {gl} = this
    if (!gl) return

    const texture = gl.createTexture() as WebGLTexture

    gl.bindTexture(gl.TEXTURE_2D, texture)
    // 对纹理图像进行y轴反转，因为WebGL纹理坐标系统的t轴（分为t轴和s轴）的方向和图片的坐标系统Y轴方向相反。因此将Y轴进行反转。
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    // 配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    this.textures = [texture]

    gl.bindTexture(gl.TEXTURE_2D, texture)
  }

  protected drawFrame(_?: unknown, info?: any) {
    const {gl, video} = this
    if (!gl || !video) {
      super.drawFrame(_, info)
      return
    }
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    super.drawFrame(_, info)
  }
}
