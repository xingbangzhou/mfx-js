export default `#version 300 es

precision mediump float;

in vec2 v_texcoord;

uniform sampler2D u_texture;
uniform sampler2D u_dstTexture;

out vec4 fragColor;

vec3 screen(vec3 dst, vec3 src) {
  return 1.0 - (1.0 - dst) * (1.0 - src);
}

void main(void) {
  vec4 src = texture(u_texture, v_texcoord);
  vec4 dst = texture(u_dstTexture, v_texcoord);

  vec4 blendColor = vec4(screen(dst.rgb, src.rgb), dst.a);

  fragColor = mix(dst, blendColor, step(0.001, src.a));
}
`
