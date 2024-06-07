export default `#version 300 es

precision mediump float;

in vec2 v_texcoord;

uniform sampler2D u_texture;
uniform sampler2D u_maskTexture;

out vec4 fragColor;

void main(void) {
  vec4 texColor = texture(u_texture, v_texcoord);
  vec4 maskColor = texture(u_maskTexture, v_texcoord);

  float alpha = maskColor.a;
  
  fragColor = texColor * (1.0 - alpha);
}
`
