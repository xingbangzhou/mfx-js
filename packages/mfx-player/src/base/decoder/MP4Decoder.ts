import MP4Demuxer, {MP4Config} from './MP4Demuxer'

/**
 * @brief 微秒比较函数
 * @param lhs 微秒
 * @param rhs 微秒
 * @returns  1: 大于 -1：小于 0：等于
 */
export function compareMcs(lhs: number, rhs: number) {
  const diff = lhs - rhs
  if (diff > 999) return 1
  if (diff < -999) return -1
  return 0
}

export enum DecoderStatus {
  None,
  Ready,
  Finished,
  Error,
}

export default class MP4Decoder {
  /**
   * @brief 构造函数
   * @param url       视频路径
   * @param totalMcs  总共需播放时长
   * @param frames    总帧数
   */
  constructor(uri: string | Blob, totalMcs: number, frames: number) {
    this.totalMcs = totalMcs

    this.decoder = new VideoDecoder({
      output: (videoFrame: VideoFrame) => {
        let status = this._status
        if (this.decoder.decodeQueueSize === 0) {
          status = DecoderStatus.Finished
        } else if (status === DecoderStatus.None) {
          status = DecoderStatus.Ready
        }
        this._status = status

        // 判断是否需要丢弃,保留最后一帧
        if (status !== DecoderStatus.Finished) {
          const vtimestamp = this.timestamp(videoFrame)
          if (compareMcs(vtimestamp, this.seekMcs) < 0) {
            videoFrame.close()
            return
          }
        }
        // 入帧
        this.frameList.push(videoFrame)
      },
      error: (error: unknown) => {
        console.log(error)
        this._status = DecoderStatus.Error
        this.setStatus('decode', `error: ${String(error)}`)
      },
    })

    this.demuxer = new MP4Demuxer(uri, {
      onConfig: this.onConfig,
      onChunk: this.onChunk,
      setStatus: this.setStatus,
    })
  }

  private totalMcs: number // 微秒
  private seekMcs = 0 // 微秒
  // 解封装数据
  private demuxer?: MP4Demuxer
  private config?: MP4Config
  private chunksList?: any[][]
  // 解码器
  private decoder: VideoDecoder
  private frameList: VideoFrame[] = []

  private _status = DecoderStatus.None
  get status() {
    return this._status
  }

  /**
   * 定位当前帧列表中的帧
   * @param timestamp 微秒
   */
  seek(timestamp: number) {
    this.seekMcs = timestamp

    const frameList = this.frameList
    let i = 0
    for (const l = frameList.length; i < l - 1; i++) {
      const vframe = frameList[i]
      if (compareMcs(this.timestamp(vframe), timestamp) === 1) break
      vframe.close()
    }
    this.frameList = frameList.slice(i)

    return this.frameList[0]
  }

  /**
   * 定位下一帧需要的帧
   * @param timestamp 微秒
   */
  next(timestamp: number) {
    // 记录当前需要寻找的帧
    this.seekMcs = timestamp
    const frameList = this.frameList
    if (this._status === DecoderStatus.Finished && frameList.length === 1) return
    const vframe = frameList[0]
    if (vframe && compareMcs(this.timestamp(vframe), timestamp) < 0) {
      this.frameList = frameList.slice(1)
    }
  }

  /**
   * @brief 当前列表第一帧的时间戳
   */
  get timestamp0() {
    const vframe = this.frameList[0]
    if (!vframe) return 0

    return this.timestamp(vframe)
  }

  // 重置都某事件开始播
  reset() {
    if (this.decoder.state !== 'closed' && this.decoder.state !== 'unconfigured') {
      this.decoder.reset()
    }

    this.seekMcs = 0
    this._status = DecoderStatus.None
    this.clearFrames()

    if (!this.config || !this.chunksList) return
    this.decoder.configure(this.config)

    for (const chunks of this.chunksList) {
      const ktimestamp = chunks[0].timestamp
      // 超出EndTime的关键帧列表不需要解码
      if (compareMcs(ktimestamp, this.totalMcs) === 1) break
      for (const el of chunks) {
        this.decoder.decode(el)
      }
    }
  }

  destroy() {
    this.clearFrames()
    this.decoder.close()
    this.demuxer?.destroy()
    this.demuxer = undefined

    this.config = undefined
    this.chunksList = undefined
    this.seekMcs = 0
    this._status = DecoderStatus.None
  }

  private onConfig = (config: MP4Config) => {
    this.config = config
    this.decoder.configure(config)
  }

  private onChunk = (chunk: EncodedVideoChunk) => {
    this.chunksList = this.chunksList || []

    let chunks: EncodedVideoChunk[] | undefined = undefined
    if (chunk.type === 'key') {
      // 关键帧
      chunks = [chunk]
      this.chunksList.push(chunks)
    } else {
      // 延迟帧
      chunks = this.chunksList[this.chunksList.length - 1]
      if (chunks) {
        chunks.push(chunk)
      }
    }
    const key = chunks?.[0]
    if (key) {
      const timestamp = key.timestamp - (key.duration || 0)
      // 超出EndTime部分不需要解码
      if (compareMcs(timestamp, this.totalMcs) <= 0) {
        this.decoder.decode(chunk)
      }
    }
  }

  private setStatus = (type: string, message: any) => {
    console.log('MP4Decoder', 'setStatus', type, message)
  }

  private timestamp(videoFrame: VideoFrame) {
    return videoFrame.timestamp - (videoFrame.duration || 0)
  }

  private clearFrames() {
    const frameList = this.frameList
    this.frameList = []
    for (const vframe of frameList) {
      vframe.close()
    }
  }
}
