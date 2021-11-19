import ByteArray from './byteArray'

export default class Pack {
  arrayBuffer = new ByteArray()

  constructor() {}

  size() {
    return this.arrayBuffer.byteLength
  }

  buffer() {
    return this.arrayBuffer.buffer()
  }
  /**
   * 设置大小端模式
   * @param
   */
  setLittleEndian(bLittle = true) {
    this.arrayBuffer.setLittleEndian(bLittle)
  }
  /**
   *  @param value 写入一个字节数据
   *  取值范围[-128,127]
   */
  writeByte(value: number) {
    this.arrayBuffer.writeByte(value)
  }
  /**
   * @param value 一个 arraybuffe或Array类型的字节数组
   */
  writeBytes(
    value:
      | ArrayBuffer
      | Uint8Array
      | Int8Array
      | Int16Array
      | Uint16Array
      | Int32Array
      | Uint32Array
      | Float32Array
      | Float64Array,
  ) {
    this.arrayBuffer.writeBytes(value)
  }
  /**
   *  @param value 写入一个16位整形数据
   *  网络字节流使用小端序 LITTLE_ENDIAN
   */
  writeShort(value: number) {
    this.arrayBuffer.writeShort(value)
  }
  /**
   *  @param value 写入一个32位整形数据
   *  网络字节流使用小端序 LITTLE_ENDIAN
   */
  writeInt(value: number) {
    this.arrayBuffer.writeInt(value)
  }

  writeUint32(value: number) {
    this.arrayBuffer.writeUint32(value)
  }
  /**
   *  @param value 写入一个64位整形数据
   */
  writeLong(value: number) {
    this.arrayBuffer.writeLong(value)
  }

  writeULong(value: number) {
    this.arrayBuffer.writeUint64(value)
  }
  /**
   *  @param value 写入一个32位浮点数
   */
  writeFloat(value: number) {
    this.arrayBuffer.writeFloat(value)
  }
  /**
   *  @param value 写入一个64位浮点数
   */
  writeDouble(value: number) {
    this.arrayBuffer.writeDouble(value)
  }
  /**
   * @param value
   */
  writeBuffer(value: ArrayBuffer) {
    const len = value.byteLength
    this.arrayBuffer.writeShort(len)
    if (len > 0) {
      this.arrayBuffer.writeBytes(value)
    }
  }
  writeBuffer32(value: ArrayBuffer) {
    const len = value.byteLength
    this.arrayBuffer.writeUint32(len)
    if (len > 0) {
      this.arrayBuffer.writeBytes(value)
    }
  }
  /**
   *  @param value 写入一个字符串
   */
  writeString(value: string) {
    this.arrayBuffer.writeString(value)
  }
  /**
   *  @param value 写入一个字符串
   */
  writeString32(value: string) {
    this.arrayBuffer.writeString32(value)
  }

  print() {
    this.arrayBuffer.print()
  }
}
