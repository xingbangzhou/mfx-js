import WorkerRender from './render/WorkerRender'
import {MfxKeyValue, MfxPlayProps, PlayerOptions} from './types'

export default class MfxPlayer {
  constructor(container: HTMLElement, opts?: PlayerOptions) {
    this._ctxRender = new WorkerRender(container, opts)
  }

  private _ctxRender: WorkerRender

  /**
   * 加载数据
   * @param file 需要播放的特效资源，可以传文件的远程url地址或者是arrayBuffer
   */
  /**
   * @brief 加载数据
   * @param props 数据
   * @param keys 预先设置keys
   * @returns {keys: MfxKeyInfo[]; info?: MfxPlayInfo;} | undefined
   */
  async load(props: MfxPlayProps, keys?: MfxKeyValue | MfxKeyValue[]) {
    return this._ctxRender.load(props, keys)
  }

  /**
   * @brief 动态设置Keys
   * @param keys 数组：{key: key的名称, type: 'image' | 'video' | 'text', value: 远程url}
   */
  setKeys(keys: MfxKeyValue | MfxKeyValue[]) {
    this._ctxRender.setKeys(keys)
  }

  play() {
    this._ctxRender.play()
  }

  replay() {
    this._ctxRender.replay()
  }

  pause() {
    this._ctxRender.pause()
  }

  destroy() {
    this._ctxRender.destroy()
  }
}

export * from './types'