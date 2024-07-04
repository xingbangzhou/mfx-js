import React, {memo, useEffect, useRef} from 'react'
import './index.scss'
import {Box, Grid} from '@mui/material'
import ReactAnim, {PlayerHandler} from 'src/components/ReactAnim'

const AnimView = memo(function AnimView() {
  const handlerRef = useRef<PlayerHandler>(null)

  useEffect(() => {
    import('./mock_时间调整.json').then(data => {
      handlerRef.current?.play(data.default as any)
    })
  }, [])

  return (
    <Box className="animView">
      <Grid className="contentWrap" container spacing={2} justifyContent={'center'}>
        <div className="animWrap">
          <ReactAnim className="anim" handlerRef={handlerRef} />
        </div>
      </Grid>
    </Box>
  )
})

export default AnimView
