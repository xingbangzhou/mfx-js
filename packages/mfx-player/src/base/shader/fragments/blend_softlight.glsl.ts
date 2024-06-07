export default `#version 300 es

precision mediump float;

in vec2 v_texcoord;

uniform sampler2D u_texture;
uniform sampler2D u_dstTexture;

out vec4 fragColor;

vec3 softLight(vec3 dst, vec3 src) {
  return mix(
    sqrt(dst) * (2.0 * src - 1.0) + 2.0 * dst * (1.0 - src),
    dst - (1.0 - 2.0 * src) * dst * (1.0 - dst),
    step(0.5, src)
);
}

void main(void) {
  vec4 src = texture(u_texture, v_texcoord);
  vec4 dst = texture(u_dstTexture, v_texcoord);

  vec4 blendColor = vec4(softLight(dst.rgb, src.rgb), dst.a);

  fragColor = mix(dst, blendColor, step(0.001, src.a));
}
`
