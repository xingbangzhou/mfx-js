const Base64Table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

export function encodeBase64(value: string) {
  let output = ''
  let chr1, chr2, chr3, enc1, enc2, enc3, enc4
  let i = 0
  while (i < value.length) {
    chr1 = value.charCodeAt(i++)
    chr2 = value.charCodeAt(i++)
    chr3 = value.charCodeAt(i++)
    enc1 = chr1 >> 2
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
    enc4 = chr3 & 63
    if (isNaN(chr2)) {
      enc3 = enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }
    output =
      output + Base64Table.charAt(enc1) + Base64Table.charAt(enc2) + Base64Table.charAt(enc3) + Base64Table.charAt(enc4)
  }
  return output
}

export function decodeBase64(value: string) {
  let output = ''
  let chr1, chr2, chr3
  let enc1, enc2, enc3, enc4
  let i = 0
  value = value.replace(/[^A-Za-z0-9\+\/\=]/g, '')
  while (i < value.length) {
    enc1 = Base64Table.indexOf(value.charAt(i++))
    enc2 = Base64Table.indexOf(value.charAt(i++))
    enc3 = Base64Table.indexOf(value.charAt(i++))
    enc4 = Base64Table.indexOf(value.charAt(i++))
    chr1 = (enc1 << 2) | (enc2 >> 4)
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
    chr3 = ((enc3 & 3) << 6) | enc4
    output = output + String.fromCharCode(chr1)
    if (enc3 != 64) {
      output = output + String.fromCharCode(chr2)
    }
    if (enc4 != 64) {
      output = output + String.fromCharCode(chr3)
    }
  }
}

export function toLatin1String(buffer: Uint8Array) {
  let result = ''
  for (let i = 0; i < buffer.length; i++) {
    result += String.fromCharCode(buffer[i])
  }
  return result
}
