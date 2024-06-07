import VertexGlsl from './vertex.glsl'
import FragmentGlsl from './fragment.glsl'
import MaskAlphaGlsl from './fragments/mask_alpha.glsl'
import MaskAlphaInvertedGlsl from './fragments/mask_alpha_inverted.glsl'
import MaskLumaGlsl from './fragments/mask_luma.glsl'
import MaskLumaInvertedGlsl from './fragments/mask_luma_inverted.glsl'
import BlendAddGlsl from './fragments/blend_add.glsl'
import BlendOverlayGlsl from './fragments/blend_overlay.glsl'
import BlendScreenGlsl from './fragments/blend_screen.glsl'
import BlendSoftlightGlsl from './fragments/blend_softlight.glsl'

export const shaderGlsls = {
  vertexGlsl: VertexGlsl,
  fragmentGlsl: FragmentGlsl,
  // 遮罩
  maskAlphaGlsl: MaskAlphaGlsl,
  maskAlphaInvertedGlsl: MaskAlphaInvertedGlsl,
  maskLumaGlsl: MaskLumaGlsl,
  maskLumaInvertedGlsl: MaskLumaInvertedGlsl,
  // 混合
  blendAddGlsl: BlendAddGlsl,
  blendOverlayGlsl: BlendOverlayGlsl,
  blendScreenGlsl: BlendScreenGlsl,
  blendSoftlightGlsl: BlendSoftlightGlsl,
}
