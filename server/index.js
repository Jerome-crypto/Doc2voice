// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// Middleware
app.use(cors());
app.use('/audio', express.static(path.join(__dirname, 'audios')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure required folders exist
['uploads', 'audios'].forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
});

// Multer configuration
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE }
});

// Extract text from various file types
async function extractTextFromFile(filePath, mimetype) {
  if (mimetype === 'application/pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
  } else if (mimetype === 'text/plain') {
    return fs.readFileSync(filePath, 'utf8');
  } else if (mimetype.includes('wordprocessingml.document')) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } else {
    throw new Error(`Unsupported file type: ${mimetype}`);
  }
}

// Sanitize and shorten text
function sanitizeText(raw) {
  if (!raw) return '';
  let s = raw.replace(/[\r\n\t]+/g, ' ');
  s = s.replace(/[\x00-\x1F\x7F]/g, '');
  s = s.replace(/\s{2,}/g, ' ').trim();
  return s;
}

// Generate speech from ElevenLabs
async function generateAudioWithElevenLabs(text, filename) {
  const voiceId = 'EXAVITQu4vr4xnSDxMaL';
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not set in .env');

  const audioPath = path.join(__dirname, 'audios', filename);

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      }
    );

    fs.writeFileSync(audioPath, response.data);
    console.log(`✅ Audio saved: ${audioPath}`);
    return filename;
  } catch (error) {
    if (error.response) {
      console.error(`❌ ElevenLabs Error [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      console.error('❌ No response from ElevenLabs:', error.message);
    } else {
      console.error('❌ Request error:', error.message);
    }
    throw new Error('TTS conversion failed');
  }
}

// Auto cleanup old files
setInterval(() => {
  ['uploads', 'audios'].forEach(folder => {
    const dirPath = path.join(__dirname, folder);
    fs.readdirSync(dirPath).forEach(file => {
      const filePath = path.join(dirPath, file);
      const { mtime } = fs.statSync(filePath);
      if (Date.now() - mtime.getTime() > CLEANUP_INTERVAL_MS) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted: ${filePath}`);
      }
    });
  });
}, CLEANUP_INTERVAL_MS);

// Routes
app.get('/', (_, res) => {
  res.send('🎉 Doc2Voice backend is running!');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded or too large.' });
  }

  try {
    const filePath = req.file.path;
    const mimetype = req.file.mimetype;
    console.log(`📥 Received: ${req.file.originalname} (${mimetype})`);

    const rawText = await extractTextFromFile(filePath, mimetype);
    const sanitized = sanitizeText(rawText);

    if (!sanitized) {
      return res.status(400).json({ message: 'No readable text in file.' });
    }

    const shortText = sanitized.slice(0, 1000); // safe limit for ElevenLabs
    console.log('🧠 Final text for TTS:', shortText);

    const filename = `${Date.now()}.mp3`;

    // ✅ Generate audio from actual file content
    await generateAudioWithElevenLabs(shortText, filename);

    res.json({
      message: '✅ File processed and audio generated!',
      text: sanitized,
      audioUrl: `/audio/${filename}`
    });
  } catch (error) {
    console.error('❌ /upload error:', error);
    res.status(500).json({
      message: 'TTS failed',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔐 API key loaded: ${!!process.env.ELEVENLABS_API_KEY}`);
});
