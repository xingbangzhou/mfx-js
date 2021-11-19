/**
 *  @param bytes ArrayBuffer类型的字节数据
 */

export type ByteBuffer =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | ArrayBuffer

export default class ByteArray {
  private _dv: DataView
  private _bytes: ArrayBufferLike
  private _bytesLength = 0
  private _offset = 0
  private _position = 0
  private LITTLE_ENDIAN = true
  private HIGHT_WORD_MULTIPLIER = 0x100000000

  constructor(source?: ByteBuffer) {
    if (
      source instanceof Int8Array ||
      source instanceof Uint8Array ||
      source instanceof Int16Array ||
      source instanceof Uint16Array ||
      source instanceof Int32Array ||
      source instanceof Uint32Array ||
      source instanceof Float32Array ||
      source instanceof Float64Array
    ) {
      this._offset = source.byteOffset
      this._bytes = source.buffer
    } else if (source instanceof ArrayBuffer) {
      this._bytes = source
    } else {
      this._bytes = new ArrayBuffer(0)
    }

    this._bytesLength = this._bytes.byteLength

    this.LITTLE_ENDIAN = true
    this.HIGHT_WORD_MULTIPLIER = 0x100000000
    this._dv = new DataView(this._bytes)
    this._position = this._offset
  }

  /**
   *  @param length 扩充的容器长度,单位 byte
   *  扩充容器
   */
  private plusCapacity(length: number) {
    let plusLength = this._bytesLength
    const PLUS_VALUE_MIN = 16
    while (plusLength < length) {
      plusLength *= 2
      plusLength = plusLength <= PLUS_VALUE_MIN ? PLUS_VALUE_MIN : plusLength
    }

    // 扩充容器
    const bytesNew = new ArrayBuffer(this._bytes.byteLength + length)
    const dvNew = new Uint8Array(bytesNew)

    // 创建容器副本
    const dvCopy = new Uint8Array(this._bytes)
    dvNew.set(dvCopy, 0)
    this._bytes = dvNew.buffer

    // 构建新的DataView
    this._dv = new DataView(this._bytes)
  }
  /**
   * 设置大小端模式
   * @param
   */
  setLittleEndian(bLittle = true) {
    this.LITTLE_ENDIAN = bLittle
  }

  /**
   *  @param value 写入一个有符号的字节数据
   *  取值范围[-128,127]
   */
  writeByte(value: number) {
    this._position++
    this._bytesLength++
    if (this._position >= this._bytes.byteLength) {
      this.plusCapacity(1)
    }
    this._dv.setInt8(this._position - 1, value)
  }
  /**
   * @param value 一个 arraybuffe或Array类型的字节数组
   */
  writeBytes(
    data:
      | Int8Array
      | Uint8Array
      | Int16Array
      | Uint16Array
      | Int32Array
      | Uint32Array
      | Float32Array
      | Float64Array
      | ArrayBuffer,
  ) {
    let length = 0
    let dataDV: Uint8Array | undefined = undefined

    if (data instanceof ArrayBuffer) {
      length = data.byteLength
      dataDV = new Uint8Array(data)
    } else if (data instanceof Uint8Array) {
      length = data.length
      dataDV = data
    } else if (
      data instanceof Int8Array ||
      data instanceof Int16Array ||
      data instanceof Uint16Array ||
      data instanceof Int32Array ||
      data instanceof Uint32Array ||
      data instanceof Float32Array ||
      data instanceof Float64Array
    ) {
      length = data.byteLength
      dataDV = new Uint8Array(data.buffer)
    }

    if (length > 0 && dataDV) {
      if (this._position + length >= this._bytes.byteLength) {
        this.plusCapacity(length)
      }
      const bytesDV = new Uint8Array(this._bytes)
      bytesDV.set(dataDV, this._position)
      this._position += dataDV.byteLength
      this._bytesLength += dataDV.byteLength
    }
  }
  /**
   *  @param value 写入32位整形数据
   *  网络字节流使用小端序 LITTLE_ENDIAN
   */
  writeInt(value: number) {
    this._position += 4
    this._bytesLength += 4
    if (this._position >= this._bytes.byteLength) {
      this.plusCapacity(4)
    }
    this._dv.setInt32(this._position - 4, value, this.LITTLE_ENDIAN)
  }

  writeUint32(value: number) {
    this._position += 4
    this._bytesLength += 4
    if (this._position >= this._bytes.byteLength) {
      this.plusCapacity(4)
    }
    this._dv.setUint32(this._position - 4, value, this.LITTLE_ENDIAN)
  }
  /**
   *  @param value 写入一个有符号的16位整形数据
   *  网络字节流使用小端序 LITTLE_ENDIAN
   */
  writeShort(value: number) {
    this._position += 2
    this._bytesLength += 2
    if (this._position >= this._bytes.byteLength) {
      this.plusCapacity(2)
    }
    this._dv.setInt16(this._position - 2, value, this.LITTLE_ENDIAN)
  }
  /**
   *  @param value 写入一个有符号的64位整形数据
   */
  writeLong(value: number) {
    this._position += 8
    this._bytesLength += 8
    if (this._position >= this._bytes.byteLength) {
      this.plusCapacity(8)
    }
    const hi = Math.floor(value / this.HIGHT_WORD_MULTIPLIER)
    this._dv.setUint32(this._position - 8, value, this.LITTLE_ENDIAN)
    this._dv.setInt32(this._position - 4, hi, this.LITTLE_ENDIAN)
  }

  writeUint64(value: number) {
    this._position += 8
    this._bytesLength += 8
    if (this._position >= this._bytes.byteLength) {
      this.plusCapacity(8)
    }

    const hi = Math.floor(value / this.HIGHT_WORD_MULTIPLIER)
    this._dv.setUint32(this._position - 8, value, this.LITTLE_ENDIAN)
    this._dv.setUint32(this._position - 4, hi, this.LITTLE_ENDIAN)
  }
  /**
   *  @param value 写入一个有符号的32位浮点数
   */
  writeFloat(value: number) {
    this._position += 4
    this._bytesLength += 4
    if (this._position >= this._bytes.byteLength) {
      this.plusCapacity(4)
    }
    this._dv.setFloat32(this._position - 4, value, this.LITTLE_ENDIAN)
  }
  /**
   *  @param value 写入一个有符号的64位浮点数
   */
  writeDouble(value: number) {
    this._position += 8
    this._bytesLength += 8
    if (this._position >= this._bytes.byteLength) {
      this.plusCapacity(8)
    }
    this._dv.setFloat64(this._position - 8, value, this.LITTLE_ENDIAN)
  }
  /**
   *  @param value 写入一个UTF-8格式的字符串
   */
  writeString(value: string) {
    const len = value.length
    this.writeShort(len)
    if (len > 0) {
      const bytesValue = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        bytesValue[i] = value.charCodeAt(i)
      }
      this.writeBytes(bytesValue)
    }
  }

  writeString32(value: string) {
    const len = value.length
    this.writeUint32(len)
    if (len > 0) {
      const bytesValue = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        bytesValue[i] = value.charCodeAt(i)
      }
      this.writeBytes(bytesValue)
    }
  }

  /**
   *  读取一个字节(有符号的字节)
   */
  readByte() {
    this._position++
    return this._dv.getInt8(this._position - 1)
  }

  readUByte() {
    this._position++
    return this._dv.getUint8(this._position - 1)
  }
  /**
   *  读取一个16位整数
   */
  readShort() {
    this._position += 2
    return this._dv.getInt16(this._position - 2, this.LITTLE_ENDIAN)
  }
  /**
   *  读取一个16位整数
   */
  readUShort() {
    this._position += 2
    return this._dv.getUint16(this._position - 2, this.LITTLE_ENDIAN)
  }
  /**
   *  读取一个32位整数
   */
  readInt() {
    this._position += 4
    return this._dv.getInt32(this._position - 4, this.LITTLE_ENDIAN)
  }
  /**
   *  读取一个无符号32位整数
   */
  readUint32() {
    this._position += 4
    return this._dv.getUint32(this._position - 4, this.LITTLE_ENDIAN)
  }
  /**
   *  读取一个32位浮点数
   */
  readFloat() {
    this._position += 4
    return this._dv.getFloat32(this._position - 4, this.LITTLE_ENDIAN)
  }
  /**
   *  读取一个64位浮点数
   */
  readDouble() {
    this._position += 8
    return this._dv.getFloat64(this._position - 8, this.LITTLE_ENDIAN)
  }
  /**
   *  读取一个64位整数
   */
  readLong() {
    this._position += 8
    const hi = this._dv.getInt32(this._position - 4, this.LITTLE_ENDIAN)
    const lo = this._dv.getUint32(this._position - 8, this.LITTLE_ENDIAN)
    return lo + hi * this.HIGHT_WORD_MULTIPLIER
  }
  /**
   *  读取一个无符号64位整数
   */
  readULong() {
    return this.readUint64()
  }

  readUint64() {
    this._position += 8

    const hi = this._dv.getUint32(this._position - 4, this.LITTLE_ENDIAN)
    const lo = this._dv.getUint32(this._position - 8, this.LITTLE_ENDIAN)
    return lo + hi * this.HIGHT_WORD_MULTIPLIER
  }
  /**
   *  读取指定长度的字节数据
   *  @param length 读取长度为length的字节数据, 0为默认读取完
   */
  readBytes(length = 0) {
    if (length === 0) {
      length = this._bytesLength - this._position
    }

    if (this._bytesLength - this._position < length) {
      throw Error(' Error : Unable to read the data of length . [readBytes byteLength=' + length + ']')
    }

    this._position += length
    return new Uint8Array(this._bytes, this._position - length, length)
  }

  readBuffer(length: number) {
    if (this._bytesLength - this._position < length) {
      throw Error(' Error : Unable to read the data of length . [readBuffer byteLength=' + length + ']')
    }

    this._position += length

    return this.slice(this._position - length, this._position)
  }
  /**
   *  读取一个String字符串
   */
  readString() {
    const readLength = this.readUShort()
    if (readLength === 0) {
      return ''
    }
    const bytes = this.readBytes(readLength)
    const nums: number[] = []
    bytes.forEach(el => {
      nums.push(el)
    })
    return String.fromCharCode.apply(null, nums)
  }

  readString32() {
    const readLength = this.readUint32()
    if (readLength === 0) {
      return ''
    }
    const bytes = this.readBytes(readLength)
    const nums: number[] = []
    bytes.forEach(el => {
      nums.push(el)
    })
    return String.fromCharCode.apply(null, nums)
  }
  /**
   * 获取ByteArray里的字节数据
   */
  buffer() {
    return this.slice(0, this._bytesLength)
  }
  /**
   * 以Copy的形式从 begin 到 end 之间的字节数据
   * @param begin
   * @param end
   * @return ArrayBuffer
   */
  slice(begin: number, end?: number) {
    if (end === undefined) {
      end = this._bytesLength
    }
    return this._bytes.slice(begin, end)
  }
  /**
   * 返回字节长度
   */
  get byteLength() {
    return this._bytesLength
  }

  get position() {
    return this._position
  }

  pos(value: number) {
    this._position = value
  }

  print() {
    console.log('ByteArray.print', this._bytesLength, this._bytes, this._dv, this._position)
  }
}
