import styled from '@emotion/styled'
import {forwardRef, memo, Ref} from 'react'
import Ripple from './Ripple'

export interface ButtonProps {
  className?: string
  style?: React.CSSProperties
  title?: string
}

const ButtonWrapper = styled.button`
  display: inline-flex;
  position: relative;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  outline: unset;
  border: unset;
  margin: 0;
  border-radius: 0;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
  text-decoration: none;
  text-align: center;
  -moz-appearance: none;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  background-color: turquoise;
`

const Button = forwardRef(function Button(props: ButtonProps, ref?: Ref<HTMLButtonElement>) {
  const {className, style, title} = props

  return (
    <ButtonWrapper ref={ref} className={className} style={style}>
      {title}
      <Ripple />
    </ButtonWrapper>
  )
})

export default memo(Button)
