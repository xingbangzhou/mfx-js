import styled from '@emotion/styled'
import {memo, useCallback} from 'react'
import drawPointer from './drawPointer'
import drawRectangle from './drawRectangle'
import {clearGl} from './glFns'

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #909090;
`

const GLScene = memo(function GLScene() {
  const onRef = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) {
      console.error('Unable to initialize WebGL. Your browser or machine may not support it.')
      return
    }
    clearGl(gl)
    drawRectangle(gl)
    drawPointer(gl)
  }, [])

  return (
    <Container>
      <canvas style={{width: '400px', height: '400px'}} width="400px" height="400px" ref={onRef} />
    </Container>
  )
})

export default GLScene
