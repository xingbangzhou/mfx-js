import MP4Demuxer, {MP4DemuxConfig} from './MP4Demuxer'

function compareNs(lhs: number, rhs: number) {
  const diff = lhs - rhs
  if (diff > 999) return 1
  if (diff < -999) return -1
  return 0
}

export default class MP4Decoder {
  constructor(uri: string) {
    this.decoder = new VideoDecoder({
      output: videoFrame => {
        if (videoFrame.timestamp - this.seekTime >= 0) {
          this.videoFrames = this.videoFrames || []
          this.videoFrames.push(videoFrame)
        } else {
          videoFrame.close()
        }
      },
      error: error => {
        this.setStatus('decode', error)
      },
    })

    this.demuxer = new MP4Demuxer(uri, {
      onConfig: this.onConfig,
      onChunk: this.onChunk,
      setStatus: this.setStatus,
    })
  }

  private decoder: VideoDecoder
  private demuxer: MP4Demuxer
  private config?: MP4DemuxConfig
  private chunksList?: EncodedVideoChunk[][]
  private seekTime = 0
  private videoFrames?: VideoFrame[]

  // 获取当前视频帧
  get videoFrame() {
    return this.videoFrames?.[0]
  }

  // 移动到下一帧
  next() {
    const videoFrame = this.videoFrames?.[0]
    if (videoFrame) {
      videoFrame.close()
      this.videoFrames = this.videoFrames?.slice(1)
    }
  }

  // time: ms
  seek(time: number) {
    const lastTime = this.seekTime
    this.seekTime = time * 1000
    if (this.seekTime >= lastTime) {
      const videoFrames = this.videoFrames || []
      const l = videoFrames.length
      let i = 0
      while (i < l - 1 && l > 1) {
        const vf = videoFrames[i]
        if (compareNs(vf.timestamp, this.seekTime) === 1) break
        vf.close()
        i++
      }
      this.videoFrames = videoFrames.slice(i)
    } else if (this.config) {
      // 定位到之前
      if (this.decoder.state !== 'closed' && this.decoder.state !== 'unconfigured') {
        this.decoder.reset()
      }
      this.decoder.configure(this.config)
      this.videoFrames = this.videoFrames?.filter(el => el.close())
      this.videoFrames = []

      if (this.chunksList) {
        let i = 0
        const l = this.chunksList?.length
        for (; i < l; i++) {
          const chunks = this.chunksList[i]
          if (compareNs(chunks[0].timestamp, this.seekTime) === 1) break
        }
        if (i >= this.chunksList.length) {
          i = this.chunksList.length - 1
        }
        if (compareNs(this.chunksList[i][0].timestamp, this.seekTime) === 1) {
          i = Math.max(i - 1, 0)
        }
        for (; i < l; i++) {
          const chunks = this.chunksList[i]
          chunks.forEach(el => this.decoder.decode(el))
        }
      }
    }
  }

  destroy() {
    this.demuxer.destroy()
    this.decoder.close()
    this.config = undefined
    this.chunksList = undefined
    this.videoFrames?.forEach(el => el.close())
    this.videoFrames = undefined
  }

  private onConfig = (config: MP4DemuxConfig) => {
    this.config = config
    this.decoder.configure(config)
  }

  private onChunk = (chunk: EncodedVideoChunk) => {
    this.chunksList = this.chunksList || []
    // 关键帧
    if (chunk.type === 'key') {
      this.chunksList.push([chunk])
    } else {
      // 延迟帧
      const kl = this.chunksList.length
      const chunks = this.chunksList[kl - 1]
      if (chunks) {
        chunks.push(chunk)
      }
    }
    // 直接解码
    this.decoder.decode(chunk)
  }

  private setStatus = (type: string, message: any) => {
    console.log('MP4Decoder', 'setStatus', type, message)
  }
}
