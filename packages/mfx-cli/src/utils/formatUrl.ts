import url from 'url'
import chalk from 'chalk'
import {ip} from 'address'
import {gateway4sync} from 'default-gateway'

export default function formatUrl(protocol: string, host: string, port: number, pathname = '/') {
  const format = (hostname: string) =>
    url.format({
      protocol,
      hostname,
      port,
      pathname,
    })

  const pretty = (hostname: string) =>
    url.format({
      protocol,
      hostname,
      port: chalk.bold(port),
      pathname,
    })

  const isUnspecifiedHost = host === '0.0.0.0' || host === '::'
  let prettyHost, lanUrlForConfig
  let lanUrlForTerminal = chalk.gray('unavailable')
  if (isUnspecifiedHost) {
    prettyHost = 'localhost'
    try {
      // This can only return an IPv4 address
      const gw4 = gateway4sync()
      lanUrlForConfig = gw4.int ? ip(gw4.int) : null
      if (lanUrlForConfig) {
        // Check if the address is a private ip
        // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
        if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(lanUrlForConfig)) {
          // Address is private, format it for later use
          lanUrlForTerminal = pretty(lanUrlForConfig)
        } else {
          // Address is not private, so we will discard it
          lanUrlForConfig = undefined
        }
      }
    } catch (_e) {
      // ignored
    }
  } else {
    prettyHost = host
    lanUrlForConfig = host
    lanUrlForTerminal = pretty(lanUrlForConfig)
  }
  const localUrlForTerminal = pretty(prettyHost)
  const localUrlForBrowser = format(prettyHost)
  return {
    lanUrlForConfig,
    lanUrlForTerminal,
    localUrlForTerminal,
    localUrlForBrowser,
  }
}
