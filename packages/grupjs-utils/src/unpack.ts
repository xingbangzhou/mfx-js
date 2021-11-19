import ByteArray, {ByteBuffer} from './byteArray'

export default class Unpack {
  arrayBuffer: ByteArray

  constructor(buffer: ByteBuffer) {
    this.arrayBuffer = new ByteArray(buffer)
  }

  /**
   * 设置大小端模式
   * @param
   */
  setLittleEndian(bLittle = true) {
    this.arrayBuffer.setLittleEndian(bLittle)
  }
  /**
   *  读取一个字节(有符号的字节)
   */
  readByte() {
    return this.arrayBuffer.readByte()
  }
  /**
   *  读取一个字节(无符号的字节)
   */
  readUByte() {
    return this.arrayBuffer.readUByte()
  }
  /**
   *  读取指定长度的字节数据
   *  @param length 读取长度为length的字节数据
   */
  readBytes(length: number) {
    return this.arrayBuffer.readBytes(length)
  }
  /**
   *  读取一个16位整数（有符号）
   */
  readShort() {
    return this.arrayBuffer.readShort()
  }
  /**
   *  读取一个16位整数（无符号）
   */
  readUShort() {
    return this.arrayBuffer.readUShort()
  }
  /**
   *  读取一个32位整数
   */
  readInt() {
    return this.arrayBuffer.readInt()
  }
  /**
   *  读取一个无符号32位整数
   */
  readUint32() {
    return this.arrayBuffer.readUint32()
  }
  /**
   *  读取一个32位浮点数
   */
  readFloat() {
    return this.arrayBuffer.readFloat()
  }
  /**
   *  读取一个64位浮点数
   */
  readDouble() {
    return this.arrayBuffer.readDouble()
  }
  /**
   *  读取一个64位浮点数（无符号）
   */
  readUInt64() {
    return this.arrayBuffer.readUint64()
  }
  /**
   *  读取一个64位整数
   */
  readLong() {
    return this.arrayBuffer.readLong()
  }
  readULong() {
    return this.arrayBuffer.readULong()
  }
  /**
   * 读取buffer
   */
  readBuffer() {
    const readLength = this.readUShort()
    if (readLength === 0) {
      return new ArrayBuffer(0)
    }
    return this.arrayBuffer.readBuffer(readLength)
  }

  readBuffer32() {
    const readLength = this.readUint32()
    if (readLength === 0) {
      return new ArrayBuffer(0)
    }
    return this.arrayBuffer.readBuffer(readLength)
  }
  /**
   *  读取一个UTF-8格式的字符串
   */
  readString() {
    return this.arrayBuffer.readString()
  }
  readString32() {
    return this.arrayBuffer.readString32()
  }
}
