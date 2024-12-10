import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { 
  Box, 
  Button, 
  TextField, 
  Paper, 
  Typography,
  List,
  ListItem,
  IconButton
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';

const VideoEditor = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const playerRef = useRef(null);

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    setVideoFile(URL.createObjectURL(file));
  };

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    setAudioFile(URL.createObjectURL(file));
  };

  const addSubtitle = () => {
    setSubtitles([
      ...subtitles,
      {
        startTime: currentTime,
        endTime: currentTime + 2,
        text: ''
      }
    ]);
  };

  const updateSubtitle = (index, field, value) => {
    const newSubtitles = [...subtitles];
    newSubtitles[index] = {
      ...newSubtitles[index],
      [field]: value
    };
    setSubtitles(newSubtitles);
  };

  const deleteSubtitle = (index) => {
    const newSubtitles = subtitles.filter((_, i) => i !== index);
    setSubtitles(newSubtitles);
  };

  const handleProgress = (progress) => {
    setCurrentTime(progress.playedSeconds);
    // Update current subtitle based on time
    const activeSubtitle = subtitles.find(
      sub => progress.playedSeconds >= sub.startTime && progress.playedSeconds <= sub.endTime
    );
    setCurrentSubtitle(activeSubtitle ? activeSubtitle.text : '');
  };

  const exportSubtitles = () => {
    // Convert subtitles to SRT format
    let srtContent = subtitles
      .sort((a, b) => a.startTime - b.startTime)
      .map((subtitle, index) => {
        const startTime = formatTime(subtitle.startTime);
        const endTime = formatTime(subtitle.endTime);
        return `${index + 1}\n${startTime} --> ${endTime}\n${subtitle.text}\n`;
      })
      .join('\n');

    // Create and download the file
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitles.srt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${hh}:${mm}:${ss},${ms}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Video Subtitle Editor
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" component="label">
          Upload Video
          <input
            type="file"
            hidden
            accept="video/*"
            onChange={handleVideoUpload}
          />
        </Button>
        <Button variant="contained" component="label">
          Upload Audio
          <input
            type="file"
            hidden
            accept="audio/*"
            onChange={handleAudioUpload}
          />
        </Button>
        <Button 
          variant="contained" 
          color="success" 
          onClick={exportSubtitles}
          disabled={subtitles.length === 0}
        >
          Export Subtitles (SRT)
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          {videoFile && (
            <Box sx={{ position: 'relative' }}>
              <ReactPlayer
                ref={playerRef}
                url={videoFile}
                controls
                width="100%"
                height="auto"
                onProgress={handleProgress}
                config={{
                  file: {
                    attributes: {
                      ...(audioFile && { muted: true })
                    }
                  }
                }}
              />
              {currentSubtitle && (
                <Paper
                  sx={{
                    position: 'absolute',
                    bottom: '60px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '8px 16px',
                    maxWidth: '80%',
                    textAlign: 'center',
                    zIndex: 1000
                  }}
                >
                  <Typography>{currentSubtitle}</Typography>
                </Paper>
              )}
            </Box>
          )}
          {audioFile && (
            <ReactPlayer
              url={audioFile}
              playing={playerRef.current?.player?.isPlaying}
              style={{ display: 'none' }}
            />
          )}
        </Box>

        <Paper sx={{ flex: 1, p: 2, maxHeight: '600px', overflow: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Subtitles</Typography>
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={addSubtitle}
            >
              Add Subtitle
            </Button>
          </Box>

          <List>
            {subtitles.map((subtitle, index) => (
              <ListItem key={index} sx={{ flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                  <TextField
                    label="Start Time"
                    type="number"
                    size="small"
                    value={subtitle.startTime}
                    onChange={(e) => updateSubtitle(index, 'startTime', parseFloat(e.target.value))}
                  />
                  <TextField
                    label="End Time"
                    type="number"
                    size="small"
                    value={subtitle.endTime}
                    onChange={(e) => updateSubtitle(index, 'endTime', parseFloat(e.target.value))}
                  />
                  <IconButton onClick={() => deleteSubtitle(index)} color="error">
                    <Delete />
                  </IconButton>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  label="Subtitle Text"
                  value={subtitle.text}
                  onChange={(e) => updateSubtitle(index, 'text', e.target.value)}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default VideoEditor;
