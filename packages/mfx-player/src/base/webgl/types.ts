export type ThisWebGLContext = WebGL2RenderingContext & {
  attribs: {
    position: number
    texcoord: number
  }
  uniforms: {
    matrix: WebGLUniformLocation
    opacity: WebGLUniformLocation
    isAlpha: WebGLUniformLocation
  }
}
