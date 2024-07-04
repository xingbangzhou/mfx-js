import {MfxKeyInfo, MfxKeyValue, MfxPlayInfo, PlayerOptions, MfxPlayProps} from '../../types'

// 执行线程函数参数映射
export class InvokeParameterMap {
  instance: {id: number; canvas: OffscreenCanvas; opts?: PlayerOptions} = null as any
  load: {id: number; resolveId: number; props: MfxPlayProps; keys?: MfxKeyValue | MfxKeyValue[]} = null as any
  setKeys: {id: number; keys: MfxKeyValue | MfxKeyValue[]} = null as any
  play: {id: number} = null as any
  replay: {id: number} = null as any
  pause: {id: number} = null as any
  destroy: {id: number} = null as any
  resizeCanvasToDisplaySize: {id: number; width: number; height: number} = null as any
}

// 线程消息的参数映射
export class CallbackParameterMap {
  'loaded': {resolveId: number; keys?: MfxKeyInfo[]; info?: MfxPlayInfo} = null as any
  'play' = undefined
  'frame': number = null as any
  'pause' = undefined
  'end' = undefined
  'destroy' = undefined
}
