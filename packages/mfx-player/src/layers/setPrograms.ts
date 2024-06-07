import {shaderGlsls} from '../base/shader'
import {Program, ThisWebGLContext} from '../base/webgl'
import {BlendMode, TrackMatteType} from '../types'

const simpleVertexGlsl = `#version 300 es

in vec2 a_position;  // 接受顶点坐标
in vec2 a_texcoord;  // 接受纹理坐标

out vec2 v_texcoord;

void main() {
  gl_Position = vec4(a_position, 0, 1.0);

  v_texcoord = a_texcoord;
}
`

const simpleFragmentGlsl = `#version 300 es

precision mediump float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

out vec4 fragColor;

void main(void) {
  vec4 texColor = texture(u_texture, v_texcoord);

  fragColor = texColor;
}
`

let curProgram: Program | null = null

export const setSimpleProgram = (gl: ThisWebGLContext) => {
  curProgram?.destroy()
  curProgram = new Program(gl, {vertexShader: simpleVertexGlsl, fragmentShader: simpleFragmentGlsl})
  curProgram.use()
}

export const setProgram = (gl: ThisWebGLContext) => {
  if (curProgram?.vertexGlsl !== shaderGlsls.vertexGlsl || curProgram?.fragmentGlsl !== shaderGlsls.fragmentGlsl) {
    curProgram?.destroy()
    curProgram = new Program(gl, {vertexShader: shaderGlsls.vertexGlsl, fragmentShader: shaderGlsls.fragmentGlsl})
    curProgram.use()
  }
}

export const setMaskProgram = (gl: ThisWebGLContext, trackType: TrackMatteType) => {
  let fragmentGlsl = ''
  switch (trackType) {
    case TrackMatteType.ALPHA:
      fragmentGlsl = shaderGlsls.maskAlphaGlsl
      break
    case TrackMatteType.ALPHA_INVERTED:
      fragmentGlsl = shaderGlsls.maskAlphaInvertedGlsl
      break
    case TrackMatteType.LUMA:
      fragmentGlsl = shaderGlsls.maskLumaGlsl
      break
    case TrackMatteType.LUMA_INVERTED:
      fragmentGlsl = shaderGlsls.maskLumaInvertedGlsl
      break
  }
  if (!fragmentGlsl) return

  curProgram?.destroy()
  curProgram = new Program(gl, {vertexShader: simpleVertexGlsl, fragmentShader: fragmentGlsl})
  curProgram.use()

  const program = curProgram.program as WebGLProgram
  const uMaskTextureLocation = gl.getUniformLocation(program, 'u_maskTexture')
  gl.uniform1i(uMaskTextureLocation, 1)
}

export const setBlendProgram = (gl: ThisWebGLContext, mode: BlendMode) => {
  let fragmentGlsl = ''
  switch (mode) {
    case BlendMode.Add:
      fragmentGlsl = shaderGlsls.blendAddGlsl
      break
    case BlendMode.Screen:
      fragmentGlsl = shaderGlsls.blendScreenGlsl
      break
    case BlendMode.Overlay:
      fragmentGlsl = shaderGlsls.blendOverlayGlsl
      break
    case BlendMode.SoftLight:
      fragmentGlsl = shaderGlsls.blendSoftlightGlsl
      break
  }
  if (!fragmentGlsl) return

  curProgram?.destroy()
  curProgram = new Program(gl, {vertexShader: simpleVertexGlsl, fragmentShader: fragmentGlsl})
  curProgram.use()

  const program = curProgram.program as WebGLProgram
  const uMaskTextureLocation = gl.getUniformLocation(program, 'u_dstTexture')
  gl.uniform1i(uMaskTextureLocation, 1)
}
