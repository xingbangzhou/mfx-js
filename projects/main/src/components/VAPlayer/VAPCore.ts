import {VAPOptions} from './types'

export default class VAPCore {
  constructor(opts: VAPOptions) {
    this.opts = opts
    this.container = opts.container
    this.fps = opts.fps || 20
    this.requestAnim = this.requestAnimFunc()

    this.initVideo()
  }

  opts: VAPOptions
  container: HTMLElement
  video?: HTMLVideoElement
  fps: number
  animId?: number
  requestAnim: (cb: () => void) => number
  useFrameCallback?: boolean

  play() {
    const prom = this.video?.play()
    prom?.catch(() => {
      if (!this.video) {
        return
      }
      this.video.muted = true
      this.video.volume = 0
      this.video.play().catch(err => {
        console.error(err)
      })
    })
  }

  pause() {
    this.video?.pause()
  }

  clear() {
    this.cancelRequestAnimation()
    this.video?.parentNode && this.video.parentNode.removeChild(this.video)
    this.video = undefined
  }

  private _drawFrame?: VAPCore['drawFrame']
  protected drawFrame(_?: unknown, info?: any) {
    this._drawFrame = this._drawFrame || this.drawFrame.bind(this, _, info)
    if (this.useFrameCallback) {
      this.animId = this.video?.['requestVideoFrameCallback'](this.drawFrame.bind(this))
    } else {
      this.animId = this.requestAnim(this._drawFrame)
    }
  }

  private initVideo() {
    const video = (this.video = document.createElement('video'))
    video.crossOrigin = 'anonymous'
    video.autoplay = false
    video.preload = 'auto'
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    if (this.opts.mute) {
      video.muted = true
      video.volume = 0
    }
    video.style.display = 'none'
    video.loop = !!this.opts.loop

    video.src = this.opts.src
    document.body.appendChild(this.video)
    this.video.load()

    if ('requestVideoFrameCallback' in this.video) {
      this.useFrameCallback = true
    }

    // 绑定事件
    this.video.addEventListener('playing', this.onPlaying)
    this.video.addEventListener('pause', this.onPause)
    this.video.addEventListener('ended', this.onEnded)
    this.video.addEventListener('canplay', this.onCanplay)
    this.video.addEventListener('error', this.onError)
    this.video.addEventListener('loadeddata', () => {
      console.log('[Video]: loadeddata', this.video?.videoWidth, this.video?.videoHeight)
      this.onLoadedData()
    })
  }

  protected onLoadedData() {
    console.log('[Video]: loadeddata', this.video?.width, this.video?.height)
  }

  private requestAnimFunc() {
    const self = this
    return function (cb: () => void) {
      return window.setTimeout(cb, 1000 / self.fps)
    }
  }

  private cancelRequestAnimation() {
    if (!this.animId) return
    if (this.useFrameCallback) {
      try {
        this.video?.['cancelVideoFrameCallback'](this.animId)
      } catch (e) {}
    } else {
      window.clearTimeout(this.animId)
    }
  }

  private firstPlaying?: boolean
  private onPlaying = () => {
    console.log('[Video]: playing')

    if (!this.firstPlaying) {
      this.firstPlaying = true

      if (!this.useFrameCallback) {
        this.drawFrame(null, null)
      }
    }
  }

  private onPause = () => {
    console.log('[Video]: pause')
  }

  private onEnded = () => {
    console.log('[Video]: ended')
  }

  private onCanplay = () => {
    console.log('[Video]: canplay')
  }

  private onError = (err: unknown) => {
    console.error('[Video]: play error: ', err)
  }
}
