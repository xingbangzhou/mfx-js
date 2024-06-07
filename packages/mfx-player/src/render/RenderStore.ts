import {LayerImageProps, LayerTextProps, LayerVideoProps, KeyItemInfo, PlayProps, KeyValue} from '../types'

export default class RenderStore {
  constructor() {}

  private _props?: PlayProps

  private _frames = 0
  private _frameRate = 30
  private _frameTime = 0 // 毫秒单位
  private _frameId = -1

  private _mapKeyInfos?: Record<string, KeyItemInfo & {fromUser?: boolean}>

  setProps(value: PlayProps) {
    this.clear()

    this._props = value
    this._frameRate = value.frameRate || 30
    this._frames = (value.duration || 0) * value.frameRate
    this._frameTime = +(1000 / this._frameRate).toFixed(3).slice(0, -1)
  }

  get frames() {
    return this._frames
  }

  get frameRate() {
    return this._frameRate
  }

  get frameTime() {
    return this._frameTime
  }

  get width() {
    return this._props?.width || 0
  }

  get height() {
    return this._props?.height || 0
  }

  get duration() {
    return this._props?.duration
  }

  set frameId(id: number) {
    this._frameId = id
  }

  get frameId() {
    return this._frameId
  }

  get rootLayers() {
    return this._props?.targetComp.layers
  }

  getCompLayer(id: number) {
    return this._props?.comps.find(el => el.id === id)
  }

  getKeyInfo(key?: string) {
    if (!key) return undefined

    return this._mapKeyInfos?.[key]
  }

  getAllKeyInfo() {
    if (!this._mapKeyInfos) return undefined
    return Object.values(this._mapKeyInfos).filter(info => !info.fromUser) as KeyItemInfo[]
  }

  setKeyValue(kvs: KeyValue | KeyValue[]) {
    this._mapKeyInfos = this._mapKeyInfos || {}

    // 单个处理
    if (!Array.isArray(kvs)) {
      let info = this._mapKeyInfos[kvs.key]
      if (!info) {
        info = {key: kvs.key, fromUser: true} as any
      }
      if (kvs.type) {
        info.type = kvs.type
      }
      info.value = kvs.value
      this._mapKeyInfos[kvs.key] = info
      return
    }
    // 列表处理
    for (const kv of kvs) {
      let info = this._mapKeyInfos[kv.key]
      if (!info) {
        info = {key: kv.key, fromUser: true} as any
      }
      if (kv.type) {
        info.type = kv.type
      }
      info.value = kv.value
      this._mapKeyInfos[kv.key] = info
    }
  }

  // 内部缓存视频、文本、图片KeyInfo
  addKeyInfo(props: LayerImageProps | LayerVideoProps | LayerTextProps) {
    const name = props.name
    if (!name) return

    this._mapKeyInfos = this._mapKeyInfos || {}

    const info = this._mapKeyInfos[name] || {key: name}
    info.type = info.type || props.type
    info.content = props.content
    info.inFrame = props.inFrame
    info.outFrame = props.outFrame
    delete info.fromUser

    this._mapKeyInfos[name] = info
  }

  private clear() {
    this._mapKeyInfos = undefined
    this._props = undefined
    this.frameId = -1
  }
}
