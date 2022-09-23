import {mat4} from 'gl-matrix'
import {initGlShaderProgram} from './glFns'
import {WebGLContext} from './glTypes'

interface ProgramInfo {
  program: WebGLProgram
  attribLocations: {
    vertexPosition: number
    vertexColor: number
  }
  uniformLocations: {
    projectionMatrix?: WebGLUniformLocation | null
    modelViewMatrix?: WebGLUniformLocation | null
  }
}

interface Buffers {
  position?: WebGLBuffer | null
  indice?: WebGLBuffer | null
  color?: WebGLBuffer | null
}

function initBuffers(gl: WebGLContext) {
  // positions
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  const positions = [0.0, 1.0, -1.0, 1.0, 0.0, 0.0, -1.0, 0.0]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  // indices
  const indiceBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indiceBuffer)
  const indices = [0, 1, 2, 1, 2, 3]
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW)

  // colors
  const colorBuffer = gl.createBuffer()
  const colors = [
    1.0,
    1.0,
    1.0,
    1.0, // 白
    1.0,
    0.0,
    0.0,
    1.0, // 红
    0.0,
    1.0,
    0.0,
    1.0, // 绿
    0.0,
    0.0,
    1.0,
    1.0, // 蓝
  ]

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    indice: indiceBuffer,
    color: colorBuffer,
  }
}

function drawScene(gl: WebGLContext, programInfo: ProgramInfo, buffers: Buffers) {
  const fieldOfView = (45 * Math.PI) / 180
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
  const zNear = 0.1
  const zFar = 100.0
  const projectionMatrix = mat4.create()
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

  const modelViewMatrix = mat4.create()
  mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0])

  {
    const numComponents = 2
    const type = gl.FLOAT
    const normalize = false
    const stribe = 0
    const offset = 0
    buffers.position && gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
    buffers.indice && gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indice)
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stribe, offset)
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
    buffers.color && gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color)
    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor)
  }

  gl.useProgram(programInfo.program)

  programInfo.uniformLocations.projectionMatrix &&
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix)
  programInfo.uniformLocations.modelViewMatrix &&
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix)

  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0)
}

export default function drawRectangle(gl: WebGLContext) {
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `

  const fsSource = `
    varying lowp vec4 vColor;

    void main() {
      gl_FragColor = vColor;
    }
  `

  const shaderProgram = initGlShaderProgram(gl, vsSource, fsSource)
  if (!shaderProgram) return

  const programInfo: ProgramInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  }

  const buffers = initBuffers(gl)

  buffers && drawScene(gl, programInfo, buffers)
}
