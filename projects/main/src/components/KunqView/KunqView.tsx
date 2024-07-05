import {MfxFramework, MfxModule} from '@mfx-js/framework'
import {uniformUrl} from 'src/utils/urlFns'
import {loadMicroApp, MicroApp} from 'qiankun'
import {CSSProperties, memo, useEffect, useMemo, useRef} from 'react'

interface KunqViewProps {
  mfxFw: MfxFramework
  name?: string
  url?: string
  className?: string
  style?: CSSProperties
  [key: string]: any
}

const KunqView = memo(function KunqView(props: KunqViewProps) {
  const {mfxFw, name, url, className, style, ...other} = props
  const rootRef = useRef<HTMLDivElement>(null)
  const microApp = useRef<MicroApp>()
  const mfxModule = useRef<MfxModule>()

  const entry = useMemo(() => {
    if (!url) return undefined
    return uniformUrl(url)
  }, [url])

  useEffect(() => {
    if (rootRef.current && entry) {
      const mId = name || entry

      mfxModule.current = mfxFw.loadModule(mId)
      microApp.current = loadMicroApp(
        {
          name: mId,
          entry: entry,
          container: rootRef.current,
          props: {
            ctx: mfxModule.current?.ctx,
          },
        },
        {
          sandbox: {
            strictStyleIsolation: true,
            experimentalStyleIsolation: true,
          },
        },
      )
    }

    return () => {
      microApp.current?.unmount()
      microApp.current?.unmountPromise.then(() => {
        mfxModule.current && mfxFw.unloadModule(mfxModule.current.id)
      })
      microApp.current = undefined
    }
  }, [entry, rootRef.current])

  return <div ref={rootRef} className={className} style={style} {...other} />
})

export default KunqView
