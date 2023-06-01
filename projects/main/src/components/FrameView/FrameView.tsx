import {CSSProperties, memo, useCallback, useEffect, useMemo, useRef} from 'react'
import {uniformUrl} from 'src/utils/urlFns'
import {MxFramework, MxModuleContext} from '@mfx-js/framework'

interface FrameViewProps {
  mxFw: MxFramework
  url?: string
  className?: string
  style?: CSSProperties
  onLoaded?: (ctx?: MxModuleContext) => void
}

const FrameView = memo(function FrameView(props: FrameViewProps) {
  const {mxFw, url, className, style, onLoaded: onLoadedProp} = props

  const rootRef = useRef<HTMLIFrameElement>(null)

  const entry = useMemo(() => {
    if (!url) return undefined
    return uniformUrl(url)
  }, [url])

  const moduleId = entry

  useEffect(() => {
    if (!rootRef.current) return
    if (!moduleId) return

    mxFw.loadFrameModule(moduleId, rootRef.current)

    return () => {
      mxFw.unloadModule(moduleId)
    }
  }, [moduleId])

  const onLoaded = useCallback(() => {
    console.log('[FrameView]', 'loaded: ', moduleId)
    if (!moduleId) return
    const ctx = mxFw.getModule(moduleId)?.ctx
    onLoadedProp?.(ctx)
  }, [moduleId])

  return (
    <iframe
      ref={rootRef}
      frameBorder="0"
      scrolling="no"
      src={url}
      className={className}
      style={style}
      onLoad={onLoaded}
    />
  )
})

export default FrameView
