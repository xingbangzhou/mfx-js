import MP4Box, {ISOFile, DataStream} from './mp4box.all'

export interface MP4DemuxConfig {
  codec: string
  codedWidth: number
  codedHeight: number
  description: any
}

export interface MP4DemuxHandles {
  onConfig(config: MP4DemuxConfig): void
  onChunk(chunk: EncodedVideoChunk): void
  setStatus(type: string, message: any): void
}

class MP4FileSink {
  constructor(file: ISOFile) {
    this.file = file
  }

  private file: ISOFile
  private _offset = 0

  write(chunk: any) {
    const buffer = new ArrayBuffer(chunk.byteLength)
    new Uint8Array(buffer).set(chunk)
    ;(buffer as any).fileStart = this._offset
    this._offset += buffer.byteLength

    console.log('fetch', (this._offset / 1024 ** 2).toFixed(1) + ' MiB')

    this.file.appendBuffer(buffer)
  }

  close() {
    console.log('fetch', 'Done')
    this.file.flush()
  }
}

export default class MP4Demuxer {
  constructor(uri: string, handles: MP4DemuxHandles) {
    this.handles = handles

    this._file = MP4Box.createFile()
    this._file.onError = (error: unknown) => this.handles?.setStatus('demux', error)
    this._file.onReady = this.onReady
    this._file.onSamples = this.onSamples

    const fileSink = new MP4FileSink(this._file)
    fetch(uri).then(response => {
      this._respBody = response.body
      this._respBody?.pipeTo(new WritableStream(fileSink, {highWaterMark: 2}))
    })
  }

  private handles: MP4DemuxHandles | null = null
  private _file: ISOFile
  private _respBody: ReadableStream<Uint8Array> | null = null

  destroy() {
    this.handles = null
    this._respBody?.cancel()
    this._respBody = null
  }

  private description(track: any) {
    const trak = this._file.getTrackById(track.id)
    for (const entry of trak.mdia.minf.stbl.stsd.entries) {
      const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C
      if (box) {
        const stream = new DataStream(new ArrayBuffer(0), 0, DataStream.BIG_ENDIAN)
        box.write(stream)

        return new Uint8Array(stream.buffer as ArrayBuffer, 8) // Remove the box header.
      }
    }
    this.handles?.setStatus('description', 'avcC, hvcC, vpcC, or av1C box not found')
    return undefined
  }

  private onReady = (info: any) => {
    this.handles?.setStatus('demux', 'Ready')
    const track = info.videoTracks[0]

    // Generate and emit an appropriate VideoDecoderConfig.
    this.handles?.onConfig({
      // Browser doesn't support parsing full vp8 codec (eg: `vp08.00.41.08`),
      // they only support `vp8`.
      codec: track.codec.startsWith('vp08') ? 'vp8' : track.codec,
      codedHeight: track.video.height,
      codedWidth: track.video.width,
      description: this.description(track),
    })

    // Start demuxing.
    this._file.setExtractionOptions(track.id)
    this._file.start()
  }

  private onSamples = (track_id: number, ref: any, samples: any[]) => {
    for (const sample of samples) {
      const chunk = new EncodedVideoChunk({
        type: sample.is_sync ? 'key' : 'delta',
        timestamp: (1e6 * sample.cts) / sample.timescale,
        duration: (1e6 * sample.duration) / sample.timescale,
        data: sample.data,
      })
      this.handles?.onChunk(chunk)
    }
  }
}
