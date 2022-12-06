import {CSSProperties, memo, useCallback, useEffect, useMemo, useRef} from 'react'
import {uniformUrl} from '@mco/utils'
import framework from 'src/core/framework'

interface FrameViewProps {
  url?: string
  className?: string
  style?: CSSProperties
}

const FrameView = memo(function FrameView(props: FrameViewProps) {
  const {url, className, style} = props

  const rootRef = useRef<HTMLIFrameElement>(null)

  const entry = useMemo(() => {
    if (!url) return undefined
    return uniformUrl(url)
  }, [url])

  const moduleId = entry

  useEffect(() => {
    if (!rootRef.current) return
    if (!moduleId) return

    framework.mcoFw.loadFrameModule(moduleId, rootRef.current)

    return () => {
      framework.mcoFw.unloadModule(moduleId)
    }
  }, [moduleId, rootRef.current])

  const onLoaded = useCallback(() => {
    console.log('[FrameView] loaded', moduleId)
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
