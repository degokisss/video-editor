import { useState } from 'react'
import VideoEditor from './components/VideoEditor'
import { CssBaseline, Container } from '@mui/material'
import './App.css'

function App() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="xl">
        <VideoEditor />
      </Container>
    </>
  )
}

export default App
