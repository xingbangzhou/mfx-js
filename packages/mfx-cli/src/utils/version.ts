export function compareVersion(lhs: string, rhs: string) {
  lhs = lhs.replace('^', '')
  rhs = rhs.replace('^', '')

  let flag = 0
  const length = Math.min(lhs.length, rhs.length)
  for (let i = 0; i < length; i++) {
    const lval = lhs.charCodeAt(i)
    const rval = rhs.charCodeAt(i)
    if (lval === rval) continue
    flag = lval < rval ? -1 : 1
    break
  }
  if (flag === 0) {
    if (lhs.length > length) {
      flag = 1
    } else if (rhs.length > length) {
      flag = -1
    }
  }

  return flag
}
