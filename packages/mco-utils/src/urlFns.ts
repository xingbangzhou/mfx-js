export function replaceUrlProto(url: string) {
  return url.replace(/^http[s]?:/i, window.location.protocol)
}
