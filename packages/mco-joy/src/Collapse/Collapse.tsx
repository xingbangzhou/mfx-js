import styled from '@emotion/styled'
import {CSSProperties, forwardRef, memo, ReactNode, Ref, useCallback, useRef} from 'react'
import {Transition} from 'react-transition-group'
import {TransitionProps} from 'react-transition-group/Transition'
import {useForkRef} from '../utils'

interface ComponentProps {
  easing: string | {enter?: string; exit?: string} | undefined
  style: React.CSSProperties | undefined
  timeout: number | {enter?: number; exit?: number}
}

interface Options {
  mode: 'enter' | 'exit'
}

export function getTransitionProps(props: ComponentProps, options: Options) {
  const {timeout, easing, style = {}} = props

  return {
    duration: style.transitionDuration ?? (typeof timeout === 'number' ? timeout : timeout[options.mode] || 0),
    easing: style.transitionTimingFunction ?? (typeof easing === 'object' ? easing[options.mode] : easing),
    delay: style.transitionDelay,
  }
}

interface CollapseProps extends Omit<TransitionProps, 'timeout'> {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  in?: boolean
  timeout?: TransitionProps['timeout']
}

const CollapseRoot = styled.ul(({ownerState}: any) => ({
  height: 0,
  overflow: 'hidden',
  ...(ownerState.state === 'entered' && {
    height: 'auto',
    overflow: 'visible',
  }),
  ...(ownerState.state === 'exited' &&
    !ownerState.in && {
      visibility: 'hidden',
    }),
}))

const CollapseWrapper = styled.div`
  display: flex;
  width: 100%;
`

const CollapseWrapperInner = styled.div`
  width: 100%;
`

const Collapse = forwardRef(function Collapse(props: CollapseProps, ref?: Ref<HTMLElement>) {
  const {children, className, style, easing, in: inProp, timeout = 300} = props

  const ownerState = {
    in: inProp,
  }

  const nodeRef = useRef<HTMLDivElement>(null)
  const handleRef = useForkRef(ref, nodeRef)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number>()
  const sizeProp = 'height'

  const getWrapperSize = useCallback(() => (wrapperRef.current ? wrapperRef.current['clientHeight'] : 0), [])

  const reset = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = undefined
    }
  }, [])

  const handleEntering = (node: HTMLElement, isAppearing: boolean) => {
    isAppearing
    reset()
    const wrapperSize = getWrapperSize()

    const {duration: transitionDuration, easing: transitionTimingFunction} = getTransitionProps(
      {style, timeout, easing},
      {
        mode: 'enter',
      },
    )

    node.style.transitionDuration =
      typeof transitionDuration === 'string' ? transitionDuration : `${transitionDuration}ms`

    node.style[sizeProp] = `${wrapperSize}px`
    node.style.transitionTimingFunction = transitionTimingFunction || ''
  }

  const handleEntered = (node: HTMLElement, isAppearing: boolean) => {
    isAppearing
    reset()
    node.style[sizeProp] = 'auto'
  }

  const handleExit = (node: HTMLElement) => {
    reset()
    const wrapperSize = getWrapperSize()
    node.style[sizeProp] = `${wrapperSize}px`
  }

  const handleExiting = (node: HTMLElement) => {
    reset()
    timerRef.current = window.setTimeout(() => {
      const {duration: transitionDuration, easing: transitionTimingFunction} = getTransitionProps(
        {style, timeout, easing},
        {
          mode: 'exit',
        },
      )

      node.style.transitionDuration =
        typeof transitionDuration === 'string' ? transitionDuration : `${transitionDuration}ms`

      node.style[sizeProp] = '0px'
      node.style.transitionTimingFunction = transitionTimingFunction || ''
    })
  }

  return (
    <Transition
      in={inProp}
      timeout={timeout}
      onEntered={handleEntered}
      onEntering={handleEntering}
      onExit={handleExit}
      onExiting={handleExiting}
    >
      {state => (
        <CollapseRoot className={className} style={style} ownerState={{...ownerState, state}} ref={handleRef}>
          <CollapseWrapper ref={wrapperRef}>
            <CollapseWrapperInner>{children}</CollapseWrapperInner>
          </CollapseWrapper>
        </CollapseRoot>
      )}
    </Transition>
  )
})

export default memo(Collapse)
