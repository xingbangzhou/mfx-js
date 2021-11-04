export function isNum(num: number): boolean {
  return typeof num === 'number' && !isNaN(num)
}

export function int(a: string): number {
  return parseInt(a, 10)
}
