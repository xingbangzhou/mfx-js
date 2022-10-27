import styled from '@emotion/styled'
import {CSSProperties, forwardRef, memo, ReactNode, Ref} from 'react'
import Ripple from './Ripple'

export interface ButtonProps {
  className?: string
  style?: CSSProperties
  content?: ReactNode
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
  background-color: #1976d2;
  color: #ffffff;
  overflow: hidden;
  padding: 0 10px;
`

const Button = forwardRef(function Button(props: ButtonProps, ref?: Ref<HTMLButtonElement>) {
  const {className, style, content} = props

  return (
    <ButtonWrapper ref={ref} className={className} style={style}>
      {content}
      <Ripple />
    </ButtonWrapper>
  )
})

export default memo(Button)
