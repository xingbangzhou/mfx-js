import {initGlShaderProgram} from './glFns'
import {WebGLContext} from './glTypes'

export default function drawPointer(gl: WebGLContext) {
  const vsSource = `
    attribute vec4 aPointer;

    void main() {
      gl_Position = aPointer;
      gl_PointSize = 10.0;
    }
  `

  const fsSource = `
    void main() {
      gl_FragColor = vec4(0.5, 0.0, 0.5, 1.0);
    }
  `

  gl.flush()

  const shaderProgram = initGlShaderProgram(gl, vsSource, fsSource)
  if (!shaderProgram) return

  const aPointer = gl.getAttribLocation(shaderProgram, 'aPointer')
  gl.vertexAttrib3f(aPointer, 0.5, 0.0, 0.0)

  gl.useProgram(shaderProgram)

  gl.drawArrays(gl.POINTS, 0, 1)
}
