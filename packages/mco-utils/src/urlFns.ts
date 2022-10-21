export function syncUrlProto(url: string) {
  return url.replace(/^http[s]?:/i, window.location.protocol)
}
