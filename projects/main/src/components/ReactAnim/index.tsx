import React, {HTMLAttributes, Ref, memo, useEffect, useImperativeHandle, useRef} from 'react'
import MfxPlayer, {PlayerOptions, MfxPlayProps, MfxKeyValue} from '@mfx-js/player'
import {useForkRef} from '@mui/material/utils'

export interface PlayerHandler {
  play(props: MfxPlayProps, keys?: MfxKeyValue | MfxKeyValue[]): void
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
    play: (props: MfxPlayProps, keys?: MfxKeyValue | MfxKeyValue[], opts?: PlayerOptions) => {
      if (!rootRef.current) return

      playerRef.current = new MfxPlayer(rootRef.current, opts)
      playerRef.current.load(props, keys).then(info => {
        console.log('ReactAnim', 'loaded: ', info)
      })
      playerRef.current?.play()
    },
  }))

  useEffect(() => {
    return () => {
      playerRef.current?.destroy()
    }
  }, [])

  return <div ref={forkRef} {...other}></div>
})

export default ReactAnim
