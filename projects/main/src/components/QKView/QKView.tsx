import {MscxModule} from '@mscx/framework'
import {uniformUrl} from '@mscx/utils'
import {loadMicroApp, MicroApp} from 'qiankun'
import {CSSProperties, memo, useEffect, useMemo, useRef} from 'react'
import mscxFw from 'src/core/mscxFw'

interface QKViewProps {
  name?: string
  url?: string
  className?: string
  style?: CSSProperties
  [key: string]: any
}

const QKView = memo(function QKView(props: QKViewProps) {
  const {name, url, className, style, ...other} = props
  const rootRef = useRef<HTMLDivElement>(null)
  const microApp = useRef<MicroApp>()
  const mscxModule = useRef<MscxModule>()

  const entry = useMemo(() => {
    if (!url) return undefined
    return uniformUrl(url)
  }, [url])

  useEffect(() => {
    if (rootRef.current && entry) {
      const mId = name || entry

      mscxModule.current = mscxFw.instance.loadModule(mId)
      microApp.current = loadMicroApp(
        {
          name: mId,
          entry: entry,
          container: rootRef.current,
          props: {
            ctx: mscxModule.current?.ctx,
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
        mscxModule.current && mscxFw.instance.unloadModule(mscxModule.current.id)
      })
      microApp.current = undefined
    }
  }, [entry, rootRef.current])

  return <div ref={rootRef} className={className} style={style} {...other} />
})

export default QKView
