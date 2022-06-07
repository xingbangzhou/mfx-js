import styled from '@emotion/styled'
import {memo, useCallback} from 'react'
import test_simple01 from './test_simple01'

const DemoRoot = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #909090;
`

const WebGLDemo = memo(function WebGLDemo() {
  const onRef = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    test_simple01(canvas)
  }, [])

  return (
    <DemoRoot>
      <canvas style={{width: '200px', height: '200px'}} ref={onRef} />
    </DemoRoot>
  )
})

export default WebGLDemo
