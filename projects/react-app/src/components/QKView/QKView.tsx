import {McoModule} from '@mco/system'
import {replaceUrlProto} from '@mco/utils'
import {loadMicroApp, MicroApp} from 'qiankun'
import {memo, useEffect, useMemo, useRef} from 'react'
import framework from 'src/core/framework'

interface QKViewProps {
  name?: string
  src?: string
}

const QKView = memo(function QKView(props: QKViewProps) {
  const {name, src} = props
  const rootRef = useRef<HTMLDivElement>(null)
  const microApp = useRef<MicroApp>()
  const mcoModule = useRef<McoModule>()

  const entry = useMemo(() => {
    if (!src) return undefined
    return replaceUrlProto(src)
  }, [src])

  useEffect(() => {
    if (rootRef.current && entry) {
      const mId = name || entry

      microApp.current = loadMicroApp({
        name: `qk-${mId}`,
        entry: entry,
        container: rootRef.current,
      })
      mcoModule.current = framework.mcoFw.loadModule(mId)
      microApp.current.mountPromise.then(() => {
        microApp.current?.update?.({ctx: mcoModule.current?.ctx})
      })
    }

    return () => {
      microApp.current?.unmount()
      microApp.current?.unmountPromise.then(() => {
        mcoModule.current && framework.mcoFw.unloadModule(mcoModule.current.mId)
      })
      microApp.current = undefined
    }
  }, [entry, rootRef.current])

  return <div ref={rootRef}></div>
})

export default QKView
