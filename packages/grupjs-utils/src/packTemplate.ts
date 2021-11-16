import {ByteBuffer} from './byteArray'
import Pack from './pack'
import Unpack from './unpack'

export enum PackType {
  Byte = 1,
  UByte,
  Short,
  UShort,
  Int,
  Uint32,
  Float,
  Long,
  ULong,
  Uint64,
  Double,
  Buffer, // ArrayBuffer
  Buffer32, // ArrayBuffer
  String,
  String32,
  Array,
  Record,
}

type BuildinType = Exclude<PackType, PackType.Array | PackType.Record>

function getBuildinFn(pkType: BuildinType, op?: boolean): Function | undefined {
  switch (pkType) {
    case PackType.Byte:
      return op ? Pack.prototype.writeByte : Unpack.prototype.readByte
    case PackType.UByte:
      return op ? Pack.prototype.writeByte : Unpack.prototype.readUByte
    case PackType.Short:
      return op ? Pack.prototype.writeShort : Unpack.prototype.readShort
    case PackType.UShort:
      return op ? Pack.prototype.writeShort : Unpack.prototype.readUShort
    case PackType.Int:
      return op ? Pack.prototype.writeInt : Unpack.prototype.readInt
    case PackType.Uint32:
      return op ? Pack.prototype.writeUint32 : Unpack.prototype.readUint32
    case PackType.Float:
      return op ? Pack.prototype.writeFloat : Unpack.prototype.readFloat
    case PackType.Long:
      return op ? Pack.prototype.writeLong : Unpack.prototype.readLong
    case PackType.ULong:
      return op ? Pack.prototype.writeULong : Unpack.prototype.readULong
    case PackType.Double:
      return op ? Pack.prototype.writeDouble : Unpack.prototype.readDouble
    case PackType.Uint64:
      return op ? Pack.prototype.writeULong : Unpack.prototype.readUInt64
    case PackType.Buffer:
      return op ? Pack.prototype.writeBuffer : Unpack.prototype.readBuffer
    case PackType.Buffer32:
      return op ? Pack.prototype.writeBuffer32 : Unpack.prototype.readBuffer32
    case PackType.String:
      return op ? Pack.prototype.writeString : Unpack.prototype.readString
    case PackType.String32:
      return op ? Pack.prototype.writeString32 : Unpack.prototype.readString32
  }
}

export type PackArray = [PackType.Array, BuildinType | PackArray | PackRecord | typeof PackTemplate]
export type PackRecord = [PackType.Record, BuildinType, BuildinType | PackArray | PackRecord | typeof PackTemplate]

export type PackTuple = [string | number, BuildinType | PackArray | PackRecord | typeof PackTemplate]

export abstract class PackTemplate {
  protected abstract packList(): PackTuple[]

  protected pack0(pack: Pack, value: typeof PackTemplate | any, type: PackTuple[1]) {
    if (Array.isArray(type)) {
      if (type[0] === PackType.Array) {
        pack.writeUint32(value.length)
        value.forEach((el: any) => {
          this.pack0(pack, el, type[1])
        })
        return
      } else if (type[0] === PackType.Record) {
        const keyType = type[1]
        const valueType = type[2]
        const size = Object.keys(value).length
        pack.writeUint32(size)
        for (const key in value) {
          const element = value[key]
          this.pack0(pack, key, keyType)
          this.pack0(pack, element, valueType)
        }
        return
      }
    }
    if (value instanceof PackTemplate) {
      value.pack(pack)
      return
    }
    const fn = getBuildinFn(type as BuildinType, true)
    if (fn) {
      fn.call(pack, value)
      return
    }
    throw `pack type is error: ${type}`
  }

  pack(pack: Pack) {
    const typelist = this.packList()
    typelist.forEach(el => {
      const attrName = el[0]
      const attrType = el[1]
      this.pack0(pack, this[attrName], attrType)
    })
  }

  protected unpack0(up: Unpack, type: PackTuple[1]) {
    if (Array.isArray(type)) {
      if (type[0] === PackType.Array) {
        const valueType = type[1]
        let count = up.readUint32()
        const result: any[] = []
        while (count--) {
          const value = this.unpack0(up, valueType)
          result.push(value)
        }
        return result
      } else if (type[0] === PackType.Record) {
        const keyType = type[1]
        const valueType = type[2]
        let count = up.readUint32()
        const result: any = {}
        while (count--) {
          const key = this.unpack0(up, keyType)
          const value = this.unpack0(up, valueType)
          result[key] = value
        }
        return result
      }
    }

    if (typeof type === 'function') {
      const value = new (type as any)()
      if (value instanceof PackTemplate) {
        value.unpack(up)
        return value
      }
    }

    const fn = getBuildinFn(type as BuildinType)
    if (fn) {
      return fn.call(up)
    }

    throw `unpack type is error: ${type}`
  }

  unpack(up: Unpack) {
    const typelist = this.packList()
    typelist.forEach(el => {
      const attrName = el[0]
      const attrType = el[1]
      this[attrName] = this.unpack0(up, attrType)
    })
  }

  toBuffer(isLITTLE_ENDIAN = true) {
    const pack = new Pack()
    pack.setLittleEndian(isLITTLE_ENDIAN)
    this.pack(pack)

    return pack.buffer()
  }

  unBuffer(value: ByteBuffer, isLITTLE_ENDIAN = true) {
    const up = new Unpack(value)
    up.setLittleEndian(isLITTLE_ENDIAN)
    this.unpack(up)
  }
}
