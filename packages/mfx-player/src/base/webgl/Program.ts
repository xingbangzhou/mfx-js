import {ThisWebGLContext} from './types'

function createShader(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type) as WebGLShader
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`)
  }

  return shader
}

export default class Program {
  constructor(gl: ThisWebGLContext, parameters: {vertexShader: string; fragmentShader: string}) {
    this.gl = gl
    const program = (this.program = gl.createProgram() as WebGLProgram)

    this.vertexGlsl = parameters.vertexShader
    this.fragmentGlsl = parameters.fragmentShader
    this.vertexShader = createShader(gl, gl.VERTEX_SHADER, parameters.vertexShader)
    this.fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, parameters.fragmentShader)

    gl.attachShader(program, this.vertexShader)
    gl.attachShader(program, this.fragmentShader)

    gl.linkProgram(program)

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error(`An error occurred linkProgram: ${gl.getProgramInfoLog(this.program)}`, this)
    }
  }

  gl: ThisWebGLContext | null
  program: WebGLProgram | null
  vertexShader: WebGLShader | null
  fragmentShader: WebGLShader | null
  readonly vertexGlsl: string
  readonly fragmentGlsl: string

  use() {
    const gl = this.gl
    const program = this.program
    if (!gl || !program) return

    gl.useProgram(program)

    gl.attribs = {
      position: gl.getAttribLocation(program, 'a_position'),
      texcoord: gl.getAttribLocation(program, 'a_texcoord'),
    }
    gl.uniforms = {
      matrix: gl.getUniformLocation(program, 'u_matrix') as WebGLUniformLocation,
      opacity: gl.getUniformLocation(program, 'u_opacity') as WebGLUniformLocation,
      isAlpha: gl.getUniformLocation(program, 'u_isAlpha') as WebGLUniformLocation,
    }
    const uTextureLocation = gl.getUniformLocation(program, 'u_texture')
    gl.uniform1i(uTextureLocation, 0)
  }

  destroy() {
    this.gl?.deleteProgram(this.program)
    this.gl = null
    this.program = null
    this.vertexShader = null
    this.fragmentShader = null
  }
}
