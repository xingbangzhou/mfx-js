import React, {HTMLAttributes, Ref, memo, useEffect, useImperativeHandle, useRef} from 'react'
import MfxPlayer, {PlayOptions, PlayProps} from '@mfx-js/player'
import {useForkRef} from '@mui/material/utils'

export interface PlayerHandler {
  play(props: PlayProps): void
}

type ReactAnimProps = {
  rootRef?: Ref<HTMLDivElement>
  handlerRef?: Ref<PlayerHandler>
} & HTMLAttributes<HTMLDivElement>

const ReactAnim = memo(function ReactAnim(props: ReactAnimProps) {
  const {handlerRef, rootRef: rootRefProp, ...other} = props
  const playerRef = useRef<MfxPlayer>()
  const rootRef = useRef<HTMLDivElement>(null)
  const forkRef = useForkRef(rootRef, rootRefProp)

  useImperativeHandle(handlerRef, () => ({
    play: (props: PlayProps, opts?: PlayOptions) => {
      if (!rootRef.current) return

      playerRef.current = new MfxPlayer(rootRef.current, opts)
      playerRef.current.load(props).then(keyInfos => {
        console.log('ReactAnim', 'loaded: ', keyInfos)
      })
      playerRef.current.play()
    },
  }))

  useEffect(() => {
    return () => {
      playerRef.current?.detroy()
    }
  }, [])

  return <div ref={forkRef} {...other}></div>
})

export default ReactAnim
