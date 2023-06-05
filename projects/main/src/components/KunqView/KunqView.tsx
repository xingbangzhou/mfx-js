import {MxFramework, MxModule} from '@mfx-js/framework'
import {uniformUrl} from 'src/utils/urlFns'
import {loadMicroApp, MicroApp} from 'qiankun'
import {CSSProperties, memo, useEffect, useMemo, useRef} from 'react'

interface KunqViewProps {
  mxFw: MxFramework
  name?: string
  url?: string
  className?: string
  style?: CSSProperties
  [key: string]: any
}

const KunqView = memo(function KunqView(props: KunqViewProps) {
  const {mxFw, name, url, className, style, ...other} = props
  const rootRef = useRef<HTMLDivElement>(null)
  const microApp = useRef<MicroApp>()
  const mxModule = useRef<MxModule>()

  const entry = useMemo(() => {
    if (!url) return undefined
    return uniformUrl(url)
  }, [url])

  useEffect(() => {
    if (rootRef.current && entry) {
      const mId = name || entry

      mxModule.current = mxFw.loadModule(mId)
      microApp.current = loadMicroApp(
        {
          name: mId,
          entry: entry,
          container: rootRef.current,
          props: {
            ctx: mxModule.current?.ctx,
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
        mxModule.current && mxFw.unloadModule(mxModule.current.id)
      })
      microApp.current = undefined
    }
  }, [entry, rootRef.current])

  return <div ref={rootRef} className={className} style={style} {...other} />
})

export default KunqView
