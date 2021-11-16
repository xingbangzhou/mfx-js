export function getUrlParam(key: string, url?: string | undefined) {
  const regResult = new RegExp('[?|&]' + key + '=' + '([^&;]+?)(&|#|;|$)').exec(url || window.location.href)
  if (regResult) {
    return decodeURIComponent(regResult[1].replace(/\+/g, '%20'))
  }
  return undefined
}
