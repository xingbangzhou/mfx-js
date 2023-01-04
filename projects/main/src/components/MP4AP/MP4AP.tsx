import React, {forwardRef, HTMLAttributes, memo, useEffect, useImperativeHandle, useRef} from 'react'
import MP4APRender from './MP4APRender'
import {MP4APOptions} from './types'
import {useForkRef} from '@mfx0/material'

export interface MP4APHandler {
  play(opts: Omit<MP4APOptions, 'container'>): void
  pause(): void
  clear(): void
}

type MP4APProps = {
  handlerRef?: React.Ref<MP4APHandler>
} & HTMLAttributes<HTMLDivElement>

const MP4AP = forwardRef(function MP4AP(props: MP4APProps, ref?: React.Ref<HTMLDivElement>) {
  const {handlerRef, ...other} = props
  const mp4apRender = useRef<MP4APRender>()
  const rootRef = useRef<HTMLDivElement>(null)
  const forkRef = useForkRef(rootRef, ref)

  useImperativeHandle(handlerRef, () => ({
    play: (opts: Omit<MP4APOptions, 'container'>) => {
      if (mp4apRender.current) mp4apRender.current.clear()
      if (!rootRef.current) {
        console.error('[MP4AP]: play', 'container is null')
      } else {
        mp4apRender.current = new MP4APRender(Object.assign(opts, {container: rootRef.current}))
        mp4apRender.current.play()
      }
    },
    pause: () => {
      mp4apRender.current?.pause()
    },
    clear: () => {
      mp4apRender.current?.clear()
    },
  }))

  useEffect(() => {
    return () => {
      mp4apRender.current?.clear()
    }
  }, [])

  return <div ref={forkRef} {...other}></div>
})

export default memo(MP4AP)
