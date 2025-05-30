const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ensure upload and output directories exist
const createDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
};
createDirIfNotExists('uploads');
createDirIfNotExists('output');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// === Routes ===

// 🔹 Convert Video to MP3
app.post('/convert-video', upload.single('video'), (req, res) => {
  const outputPath = `output/${Date.now()}.mp3`;

  ffmpeg(req.file.path)
    .toFormat('mp3')
    .on('end', () => {
      console.log('Conversion completed');
      res.download(outputPath);
    })
    .on('error', (err) => {
      console.error('FFmpeg Error:', err.message);
      res.status(500).send('Conversion Error');
    })
    .save(outputPath);
});

// 🔹 Cut Audio
app.post('/cut-audio', upload.single('audio'), (req, res) => {
  const { start, duration } = req.body;
  const outputPath = `output/${Date.now()}_cut.mp3`;

  ffmpeg(req.file.path)
    .setStartTime(start)
    .setDuration(duration)
    .on('end', () => {
      console.log('Audio cut completed');
      res.download(outputPath);
    })
    .on('error', (err) => {
      console.error('Audio Cutting Error:', err.message);
      res.status(500).send('Cutting Error');
    })
    .save(outputPath);
});

// 🔹 Cut Video
app.post('/cut-video', upload.single('video'), (req, res) => {
  const { start, duration } = req.body;
  const outputPath = `output/${Date.now()}_cut.mp4`;

  ffmpeg(req.file.path)
    .setStartTime(start)
    .setDuration(duration)
    .on('end', () => {
      console.log('Video cut completed');
      res.download(outputPath);
    })
    .on('error', (err) => {
      console.error('Video Cutting Error:', err.message);
      res.status(500).send('Cutting Error');
    })
    .save(outputPath);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
