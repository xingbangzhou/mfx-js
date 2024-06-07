export default `#version 300 es

precision mediump float;

in vec2 v_texcoord;

uniform sampler2D u_texture;
uniform sampler2D u_dstTexture;

out vec4 fragColor;

vec3 overlay(vec3 dst, vec3 src) {
  return mix(
      2.0 * dst * src,
      1.0 - 2.0 * (1.0 - dst) * (1.0 - src),
      step(0.5, dst)
  );
}

void main(void) {
  vec4 src = texture(u_texture, v_texcoord);
  vec4 dst = texture(u_dstTexture, v_texcoord);

  vec4 blendColor = vec4(overlay(dst.rgb, src.rgb), dst.a);

  fragColor = mix(dst, blendColor, step(0.001, src.a));
}
`
