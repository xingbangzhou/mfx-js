import {LayerImageProps, LayerTextProps, LayerVideoProps, MfxKeyInfo, MfxPlayProps, MfxKeyValue} from './types'
import AbstractDrawer from './layers/AbstractDrawer'

export default class Store {
  constructor() {}

  public debug = false

  private _props?: MfxPlayProps

  private _frames = 0
  private _frameRate = 30
  private _frameTime = 0 // 毫秒
  private _frameTimestamp = 0 // 微秒
  private _frameId = -1

  private mapKeyInfos?: Record<string, MfxKeyInfo & {fromUser?: boolean}>

  setProps(props: MfxPlayProps) {
    this._props = props
    this._frameRate = props.frameRate || 30
    this._frames = Math.round((props.duration || 0) * props.frameRate)
    this._frameTime = +(1000 / this._frameRate).toFixed(4).slice(0, -1)
    this._frameTimestamp = this._frameTime * 1000
  }

  get props() {
    return this._props
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

  get frameTimestamp() {
    return this._frameTimestamp
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

  getSource(id: number) {
    const props = this._props
    return props?.sourceMap?.[id]
  }

  getCompLayer(id: number) {
    return this._props?.comps.find(el => el.id === id)
  }

  getKeyInfo(key?: string) {
    if (!key) return undefined

    return this.mapKeyInfos?.[key]
  }

  getAllKeyInfo() {
    if (!this.mapKeyInfos) return undefined
    return Object.values(this.mapKeyInfos).filter(info => !info.fromUser) as MfxKeyInfo[]
  }

  setKeys(kvs: MfxKeyValue | MfxKeyValue[]) {
    this.mapKeyInfos = this.mapKeyInfos || {}

    // 单个处理
    if (!Array.isArray(kvs)) {
      const info = this.mapKeyInfos[kvs.key]
      if (!info) {
        this.mapKeyInfos[kvs.key] = {
          key: kvs.key,
          fromUser: true,
          type: kvs.type,
          value: kvs.value,
        }
      } else {
        info.type = kvs.type
        info.value = kvs.value
      }
      return
    }
    // 列表处理
    for (const kv of kvs) {
      const info = this.mapKeyInfos[kv.key]
      if (!info) {
        this.mapKeyInfos[kv.key] = {
          key: kv.key,
          fromUser: true,
          type: kv.type,
          value: kv.value,
        }
      } else {
        info.type = kv.type
        info.value = kv.value
      }
    }
  }

  // 内部缓存视频、文本、图片KeyInfo
  addKeyInfo(props: LayerImageProps | LayerVideoProps | LayerTextProps) {
    const name = props.name
    if (!name) return

    this.mapKeyInfos = this.mapKeyInfos || {}

    const info = this.mapKeyInfos[name] || {key: name}
    info.type = info.type || (props.type as any)
    info.content = props.content
    info.inFrame = props.inFrame
    info.outFrame = props.outFrame
    delete info.fromUser

    this.mapKeyInfos[name] = info
  }

  clear() {
    this.mapSyncDrawer = undefined
    this.mapKeyInfos = undefined
    this._props = undefined
    this.frameId = -1
  }

  /**
   * @brief 图层绘制同步
   */
  private mapSyncDrawer?: Record<number, AbstractDrawer<any>>

  addSync(drawer: AbstractDrawer<any>) {
    const mapDrawer = this.mapSyncDrawer || (this.mapSyncDrawer = {})

    mapDrawer[drawer.id] = drawer
  }

  removeSync(drawer: AbstractDrawer<any>) {
    if (!this.mapSyncDrawer) return

    delete this.mapSyncDrawer[drawer.id]
  }

  checkAllSync(frameId: number) {
    if (!this.mapSyncDrawer) return true

    const synDrawers = Object.values(this.mapSyncDrawer)
    this.mapSyncDrawer = undefined

    let hasSyned = true
    for (const drawer of synDrawers) {
      const flag = drawer.checkSync(frameId)
      if (!flag) {
        hasSyned = false
      }
    }

    return hasSyned
  }
}
