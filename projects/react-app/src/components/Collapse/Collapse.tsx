import styled from '@emotion/styled'
import {CSSProperties, forwardRef, memo, ReactNode, Ref, useCallback, useRef} from 'react'
import {Transition} from 'react-transition-group'
import {TransitionProps} from 'react-transition-group/Transition'
import useForkRef from 'src/hooks/useForkRef'
import {getTransitionProps} from 'src/utils/transitionFns'

interface CollapseProps extends Omit<TransitionProps, 'timeout'> {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  in?: boolean
  timeout?: TransitionProps['timeout']
}

const CollapseRoot = styled.div(({ownerState}: any) => ({
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
  const sizeProp = 'height'

  const getWrapperSize = useCallback(() => (wrapperRef.current ? wrapperRef.current['clientHeight'] : 0), [])

  const handleEntering = (node: HTMLElement, isAppearing: boolean) => {
    isAppearing
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

    console.log('handleEntering', node.style, transitionDuration, transitionTimingFunction)
  }

  const handleEntered = (node: HTMLElement, isAppearing: boolean) => {
    isAppearing
    node.style[sizeProp] = 'auto'

    console.log('handleEntered')
  }

  const handleExit = (node: HTMLElement) => {
    getWrapperSize()
    node.style[sizeProp] = `${getWrapperSize()}px`

    console.log('handleExit', getWrapperSize())
  }

  const handleExiting = (node: HTMLElement) => {
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

    // console.log('handleExiting', node.style, transitionDuration, transitionTimingFunction)
  }

  return (
    <Transition
      in={inProp}
      timeout={timeout}
      onEntered={handleEntered}
      onEntering={handleEntering}
      onExit={handleExit}
      onExiting={handleExiting}>
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
