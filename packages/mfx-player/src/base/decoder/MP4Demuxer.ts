// import MP4Box, {ISOFile, DataStream} from './mp4box.all'

const MP4Box = require('./mp4box.all')
const DataStream = MP4Box.DataStream

export interface MP4Config {
  codec: string
  codedWidth: number
  codedHeight: number
  description?: Uint8Array
}

export interface DemuxerHandles {
  onConfig(config: MP4Config): void
  onChunk(chunk: EncodedVideoChunk): void
  setStatus(type: string, message: any): void
}

class MP4FileSink {
  constructor(file: any) {
    this.file = file
  }

  private file: any
  private _offset = 0

  write(chunk: Uint8Array) {
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
  constructor(url: string | Blob, handles: DemuxerHandles) {
    this.handles = handles

    this._file = MP4Box.createFile()
    this._file.onError = (error: unknown) => this.handles?.setStatus('demux', error)
    this._file.onReady = this.onReady
    this._file.onSamples = this.onSamples

    const fileSink = new MP4FileSink(this._file)
    if (url instanceof Blob) {
      this._biteStream = url.stream()
      this._biteStream.pipeTo(new WritableStream(fileSink, {highWaterMark: 2}))
    } else {
      fetch(url)
        .then(response => {
          this._biteStream = response.body
          this._biteStream?.pipeTo(new WritableStream(fileSink, {highWaterMark: 2}))
        })
        .catch(err => {
          console.error(err)
          this.handles?.setStatus('demux', `fetch, error: ${String(err)}`)
        })
    }
  }

  private handles: DemuxerHandles | null = null
  private _file: any
  private _biteStream: ReadableStream<Uint8Array> | null = null

  destroy() {
    this.handles = null
    this._biteStream?.cancel()
    this._biteStream = null
    this._file.stop()
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
