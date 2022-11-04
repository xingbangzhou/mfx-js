import {McoModule} from '@mco/core'
import {uniformUrl} from '@mco/utils'
import {loadMicroApp, MicroApp} from 'qiankun'
import {memo, useEffect, useMemo, useRef} from 'react'
import framework from 'src/core/framework'

interface QKViewProps {
  name?: string
  url?: string
  className?: string
}

const QKView = memo(function QKView(props: QKViewProps) {
  const {name, url, className} = props
  const rootRef = useRef<HTMLDivElement>(null)
  const microApp = useRef<MicroApp>()
  const mcoModule = useRef<McoModule>()

  const entry = useMemo(() => {
    if (!url) return undefined
    return uniformUrl(url)
  }, [url])

  useEffect(() => {
    if (rootRef.current && entry) {
      const mId = name || entry

      mcoModule.current = framework.mcoFw.loadModule(mId)
      microApp.current = loadMicroApp(
        {
          name: mId,
          entry: entry,
          container: rootRef.current,
          props: {
            ctx: mcoModule.current?.ctx,
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
        mcoModule.current && framework.mcoFw.unloadModule(mcoModule.current.mId)
      })
      microApp.current = undefined
    }
  }, [entry, rootRef.current])

  return <div ref={rootRef} id="subapp-container" className={className}></div>
})

export default QKView
