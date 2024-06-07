// import {LayerProps, PlayProps, PlayState} from '../types'
// import * as m4 from '../base/m4'
// import Layer, {createLayer} from '../layers/Layer'
// import RenderStore from './RenderStore'
// import {Framebuffer, ThisWebGLContext} from '../base/webgl'
// import {setSimpleProgram} from '../layers/setPrograms'
// import {drawSimpleTexture} from '../base/primitives'
// import AttribBuffer from '../base/webgl/AttribBuffer'

// export default class WebGLRender {
//   constructor(container: HTMLElement) {
//     const canvas = (this._canvas = document.createElement('canvas'))
//     container?.appendChild(this._canvas)
//     this._gl = canvas.getContext('webgl2') as ThisWebGLContext
//     if (!this._gl) {
//       console.error(`WebGLRender, getContext('webgl') is null`)
//     }
//     this._store = new RenderStore()
//   }

//   private _canvas?: HTMLCanvasElement
//   private _gl?: ThisWebGLContext

//   private _store: RenderStore
//   private _playState = PlayState.None
//   protected frameAnimId: any
//   protected requestAnim?: (cb: () => void) => any

//   private _camera = m4.identity()
//   private _framebuffer?: Framebuffer
//   private _attribBuffer?: AttribBuffer
//   private _rootLayers?: Layer[]

//   async load(props: PlayProps) {
//     const canvas = this._canvas
//     const gl = this._gl
//     if (!canvas || !gl) return

//     const store = this._store
//     store.setProps(props)

//     const width = store.width
//     const height = store.height

//     canvas.width = width
//     canvas.height = height

//     this.resizeCanvasToDisplaySize()

//     this._camera = m4.perspectiveCamera(width, height)

//     const layerPropsList = store.rootLayers
//     this.resetLayers(gl, store, layerPropsList || [])

//     this.requestAnim = this.requestAnimFunc()
//   }

//   play() {
//     if (this._playState === PlayState.None) {
//       this._playState = PlayState.Play
//       this.render()
//     }
//   }

//   replay() {
//     this.stop()
//     this.play()
//   }

//   stop() {
//     this.cancelRequestAnimation()
//     this._playState = PlayState.None
//   }

//   resizeCanvasToDisplaySize(multiplier?: number) {
//     const canvas = this._canvas
//     if (!canvas) return
//     multiplier = multiplier || 1
//     const width = (canvas.clientWidth * multiplier) | 0
//     const height = (canvas.clientHeight * multiplier) | 0
//     if (canvas.width !== width || canvas.height !== height) {
//       canvas.width = width
//       canvas.height = height
//     }
//   }

//   destroy() {
//     this.cancelRequestAnimation()
//     this._playState = PlayState.None

//     this.clearLayers()
//     this._framebuffer?.destory()
//     this._framebuffer = undefined
//     this._attribBuffer?.destroy()
//     this._attribBuffer = undefined

//     this._canvas?.parentNode?.removeChild(this._canvas)
//     this._canvas = undefined
//   }

//   protected render = () => {
//     if (this._store.frameId === -1) {
//       this._store.frameId = 0
//     } else {
//       this._store.frameId = this._store.frameId + 1
//       if (this._store.frameId >= this._store.frames) {
//         this._store.frameId = 0
//       }
//     }

//     this.render0()

//     this.frameAnimId = this.requestAnim?.(this.render)
//   }

//   private async render0() {
//     const gl = this._gl
//     if (!gl) return
//     const store = this._store

//     const {frames, frameId, width, height} = store

//     const framebuffer = this._framebuffer || new Framebuffer(gl)
//     this._framebuffer = framebuffer

//     const frameInfo = {
//       frames,
//       frameId,
//       width,
//       height,
//       opacity: 1.0,
//       framebuffer: framebuffer,
//     }

//     gl.enable(gl.BLEND)
//     gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
//     gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

//     framebuffer.bind()
//     framebuffer.viewport(width, height)

//     const rootLayers = this._rootLayers
//     if (rootLayers) {
//       for (let i = 0, l = rootLayers?.length || 0; i < l; i++) {
//         const layer = rootLayers?.[i]
//         if (!layer.verifyTime(frameInfo.frameId)) continue
//         layer.render(gl, this._camera, frameInfo)
//       }
//     }

//     // 绘制到canvas
//     gl.bindFramebuffer(gl.FRAMEBUFFER, null)
//     gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
//     gl.clear(gl.COLOR_BUFFER_BIT)
//     gl.disable(gl.BLEND)

//     setSimpleProgram(gl)

//     gl.activeTexture(gl.TEXTURE0)
//     framebuffer.texture?.bind()

//     const attribBuffer = this._attribBuffer || new AttribBuffer(gl)
//     this._attribBuffer = attribBuffer

//     drawSimpleTexture(attribBuffer)

//     gl.bindTexture(gl.TEXTURE_2D, null)
//   }

//   private async resetLayers(gl: ThisWebGLContext, store: RenderStore, layerPropsList: LayerProps[]) {
//     this._rootLayers?.forEach(layer => layer.destroy(gl))
//     this._rootLayers = []

//     for (let i = layerPropsList.length - 1; i >= 0; i--) {
//       const props = layerPropsList[i]
//       // 遮罩过滤
//       if (props.isTrackMatte) continue
//       // 创建图层
//       const layer = createLayer(props, store)
//       if (!layer) continue
//       this._rootLayers.push(layer)
//       await layer.init(gl, layerPropsList)
//     }
//   }

//   private clearLayers() {
//     const {_gl} = this

//     this._rootLayers?.forEach(layer => layer.destroy(_gl))
//     this._rootLayers = undefined
//   }

//   private requestAnimFunc = () => {
//     return (cb: () => void) => {
//       return setTimeout(cb, this._store.frameTime)
//     }
//   }

//   private cancelRequestAnimation() {
//     if (!this.frameAnimId) return
//     clearTimeout(this.frameAnimId)
//     this.frameAnimId = null
//   }
// }
