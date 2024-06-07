import {KeyItemInfo, KeyValue, PlayOptions, PlayProps} from '../../types'

// 执行线程函数参数映射
export class InvokeParameterMap {
  instance: {id: number; canvas: OffscreenCanvas; opts?: PlayOptions} = null as any
  load: {id: number; resolveId: number; props: PlayProps; keys?: KeyValue | KeyValue[]} = null as any
  play: {id: number} = null as any
  replay: {id: number} = null as any
  pause: {id: number} = null as any
  destroy: {id: number} = null as any
  resizeCanvasToDisplaySize: {id: number; width: number; height: number} = null as any
}

// 线程消息的参数映射
export class CallbackParameterMap {
  'loaded': {resolveId: number; keyInfos?: KeyItemInfo[]} = null as any
  'play' = undefined
  'frame': number = null as any
  'pause' = undefined
  'end' = undefined
  'destroy' = undefined
}
