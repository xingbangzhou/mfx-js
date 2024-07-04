export default `#version 300 es

precision mediump float;

in vec2 v_texcoord;

uniform sampler2D u_texture;
uniform sampler2D u_dstTexture;

uniform float u_opacity;
uniform int u_isAlpha;
uniform int u_blendMode;
uniform int u_maskMode;

out vec4 fragColor;

// 遮罩模式
vec4 maskAlpha(vec4 src) {
  vec4 dst = texture(u_dstTexture, v_texcoord);

  float alpha = dst.a;

  return src * alpha;
}

vec4 maskAlphaInverted(vec4 src) {
  vec4 dst = texture(u_dstTexture, v_texcoord);
  
  float alpha = dst.a;

  return src * (1.0 - alpha);
}

vec4 maskLuma(vec4 src) {
  vec4 dst = texture(u_dstTexture, v_texcoord);
  
  float brightness = dst.r * 0.3 + dst.g * 0.6 + dst.b * 0.1;

  return src * brightness;
}

vec4 maskLumaInverted(vec4 src) {
  vec4 dst = texture(u_dstTexture, v_texcoord);
  
  float brightness = dst.r * 0.3 + dst.g * 0.6 + dst.b * 0.1;

  return src * (1.0 - brightness);
}

// 混合模式
vec4 add(vec4 src) {
  vec4 dst = texture(u_dstTexture, v_texcoord);

  return vec4(dst.rgb + src.rgb, dst.a);
}

vec4 screen(vec4 src) {
  vec4 dst = texture(u_dstTexture, v_texcoord);
  vec3 dstRgb = dst.rgb;
  vec3 srcRgb = src.rgb;
  
  vec3 rgb = 1.0 - (1.0 - dstRgb) * (1.0 - srcRgb);

  return mix(dst, vec4(rgb, dst.a), step(0.001, src.a));
}

vec4 overlay(vec4 src) {
  vec4 dst = texture(u_dstTexture, v_texcoord);
  vec3 dstRgb = dst.rgb;
  vec3 srcRgb = src.rgb;

  vec3 rgb = mix(
    2.0 * dstRgb * srcRgb,
    1.0 - 2.0 * (1.0 - dstRgb) * (1.0 - srcRgb),
    step(0.5, dstRgb)
  );

  return mix(dst, vec4(rgb, dst.a), step(0.001, src.a));
}

vec4 softLight(vec4 src) {
  vec4 dst = texture(u_dstTexture, v_texcoord);
  vec3 dstRgb = dst.rgb;
  vec3 srcRgb = src.rgb;

  vec3 rgb = mix(
    sqrt(dstRgb) * (2.0 * srcRgb - 1.0) + 2.0 * dstRgb * (1.0 - srcRgb),
    dstRgb - (1.0 - 2.0 * srcRgb) * dstRgb * (1.0 - dstRgb),
    step(0.5, srcRgb)
  );

  return mix(dst, vec4(rgb, dst.a), step(0.001, src.a));
}

vec4 lighten(vec4 src) {
  vec4 dst = texture(u_dstTexture, v_texcoord);
  vec3 dstRgb = dst.rgb;
  vec3 srcRgb = src.rgb;

  vec3 rgb = 1.0 - (1.0 - dstRgb) * (1.0 - srcRgb);

  return vec4(max(dstRgb, srcRgb), dst.a);
}

void main(void) {
  vec4 texColor = texture(u_texture, v_texcoord);

  if (u_isAlpha == 1) {
    float alpha = texture(u_texture, v_texcoord + vec2(0.5, 0.0)).r;
    texColor.a = alpha;
  }
  texColor = texColor * u_opacity;
  
  // 遮罩处理
  if (u_maskMode == 1) {
    texColor = maskAlpha(texColor);
  } else if (u_maskMode == 2) {
    texColor = maskAlphaInverted(texColor);
  } else if (u_maskMode == 3) {
    texColor = maskLuma(texColor);
  } else if (u_maskMode == 4) {
    texColor = maskLumaInverted(texColor);
  }

  // 混合处理
  if (u_blendMode == 1) {
    texColor = add(texColor);
  } else if (u_blendMode == 2) {
    texColor = screen(texColor);
  } else if (u_blendMode == 3) {
    texColor = overlay(texColor);
  } else if (u_blendMode == 4) {
    texColor = softLight(texColor);
  } else if (u_blendMode == 5) {
    texColor = lighten(texColor);
  }
  
  fragColor = texColor;
}
`
