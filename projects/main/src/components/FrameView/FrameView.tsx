import {CSSProperties, memo, useCallback, useEffect, useMemo, useRef} from 'react'
import {uniformUrl} from 'src/utils/urlFns'
import {MxFramework} from '@mfx0/framework'

interface FrameViewProps {
  fw: MxFramework
  url?: string
  className?: string
  style?: CSSProperties
}

const FrameView = memo(function FrameView(props: FrameViewProps) {
  const {fw, url, className, style} = props

  const rootRef = useRef<HTMLIFrameElement>(null)

  const entry = useMemo(() => {
    if (!url) return undefined
    return uniformUrl(url)
  }, [url])

  const moduleId = entry

  useEffect(() => {
    if (!rootRef.current) return
    if (!moduleId) return

    fw.loadFrameModule(moduleId, rootRef.current)

    return () => {
      fw.unloadModule(moduleId)
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
