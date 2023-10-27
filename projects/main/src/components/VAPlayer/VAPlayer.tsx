import React, {forwardRef, HTMLAttributes, memo, useEffect, useImperativeHandle, useRef} from 'react'
import VAPRender from './VAPRender'
import {VAPOptions} from './types'
import useForkRef from 'src/hooks/useForkRef'

export interface VAPlayerHandler {
  play(opts: Omit<VAPOptions, 'container'>): void
  pause(): void
  clear(): void
}

type VAPlayerProps = {
  handlerRef?: React.Ref<VAPlayerHandler>
} & HTMLAttributes<HTMLDivElement>

const VAPlayer = forwardRef(function MP4AP(props: VAPlayerProps, ref?: React.Ref<HTMLDivElement>) {
  const {handlerRef, ...other} = props
  const renderRef = useRef<VAPRender>()
  const rootRef = useRef<HTMLDivElement>(null)
  const forkRef = useForkRef(rootRef, ref)

  useImperativeHandle(handlerRef, () => ({
    play: (opts: Omit<VAPOptions, 'container'>) => {
      if (renderRef.current) renderRef.current.clear()
      if (!rootRef.current) {
        console.error('[VAPlayer]: play', 'container is null')
      } else {
        renderRef.current = new VAPRender(Object.assign(opts, {container: rootRef.current}))
        renderRef.current.play()
      }
    },
    pause: () => {
      renderRef.current?.pause()
    },
    clear: () => {
      renderRef.current?.clear()
    },
  }))

  useEffect(() => {
    return () => {
      renderRef.current?.clear()
    }
  }, [])

  return <div ref={forkRef} {...other}></div>
})

export default memo(VAPlayer)
