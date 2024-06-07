export default `#version 300 es

precision mediump float;

in vec2 v_texcoord;

uniform sampler2D u_texture;
uniform sampler2D u_maskTexture;

out vec4 fragColor;

void main(void) {
  vec4 texColor = texture(u_texture, v_texcoord);
  vec4 maskColor = texture(u_maskTexture, v_texcoord);

  float brightness = maskColor.r * 0.3 + maskColor.g * 0.6 + maskColor.b * 0.1;
  
  fragColor = texColor * (1.0 - brightness);
}
`
