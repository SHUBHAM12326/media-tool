const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// Video to MP3
app.post('/convert-video', upload.single('video'), (req, res) => {
  const outputPath = `output/${Date.now()}.mp3`;
  ffmpeg(req.file.path)
    .toFormat('mp3')
    .on('end', () => res.download(outputPath))
    .on('error', () => res.status(500).send('Conversion Error'))
    .save(outputPath);
});

// Cut audio
app.post('/cut-audio', upload.single('audio'), (req, res) => {
  const { start, duration } = req.body;
  const outputPath = `output/${Date.now()}_cut.mp3`;
  ffmpeg(req.file.path)
    .setStartTime(start)
    .setDuration(duration)
    .on('end', () => res.download(outputPath))
    .on('error', () => res.status(500).send('Cutting Error'))
    .save(outputPath);
});

// Cut video
app.post('/cut-video', upload.single('video'), (req, res) => {
  const { start, duration } = req.body;
  const outputPath = `output/${Date.now()}_cut.mp4`;
  ffmpeg(req.file.path)
    .setStartTime(start)
    .setDuration(duration)
    .on('end', () => res.download(outputPath))
    .on('error', () => res.status(500).send('Cutting Error'))
    .output(outputPath)
    .run();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
