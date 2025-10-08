# Transcribe Web App

A production-ready web application for transcribing audio and video files with advanced audio analysis and optional speech-to-text integration.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)

## ✨ Features

- 📁 **File Upload**: Upload audio/video files (MP3, MP4, WAV, M4A, MOV, AVI) up to 500MB
- 🎵 **Optional URL Support**: YouTube transcription (can be disabled for production)
- 🎙️ **Advanced Audio Analysis**: Real-time audio processing with FFmpeg
- 📋 **Smart Summaries**: AI-enhanced summaries with timestamped transcripts
- 🔒 **Production Ready**: Rate limiting, security headers, HTTPS support
- 🐳 **Docker Support**: Easy deployment with Docker & docker-compose
- 🚀 **Multiple Deployment Options**: VPS, Railway, Render, Heroku

## � Quick Start

### Local Development

```bash
# Clone repository
git clone YOUR_REPO_URL transcribe
cd transcribe

# Install dependencies
npm run install-all

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Open http://localhost:3000 (development) or http://localhost:3001 (production)

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- FFmpeg (for audio processing)

### Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

## 📱 Platform Support

### 📂 File Upload
- **Supports:** MP3, MP4, WAV, M4A, MOV, AVI, and more
- **Max size:** 500MB
- **Works with:** Any audio/video content from any platform

### 🔗 URL Transcription (Optional)
- YouTube URL support via `ytdl-core`
- Can be disabled in production via `ENABLE_URL_DOWNLOAD=false`
- **⚠️ Note**: May violate YouTube TOS - use at your own risk

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Server
PORT=3001
NODE_ENV=production

# Security: Disable URL downloads in production (recommended)
ENABLE_URL_DOWNLOAD=false

# Optional: Speech-to-Text API Keys
# ASSEMBLYAI_API_KEY=your_key_here
# WIT_AI_TOKEN=your_token_here
```

### Rate Limiting

The app includes built-in rate limiting:
- **API calls**: 100 requests per 15 minutes per IP
- **File uploads**: 10 uploads per hour per IP

Adjust in `server.js` if needed.

## 🚢 Deployment

### Quick Publish

```bash
# Run the publish script to verify everything is ready
./publish.sh
```

### Deployment Options

#### 1. Docker (Recommended)

```bash
# Build image
docker build -t transcribe-app:latest .

# Run container
docker-compose up -d

# Check logs
docker-compose logs -f
```

#### 2. Railway / Render (Easiest)

1. Push to GitHub
2. Connect your repository to [Railway](https://railway.app) or [Render](https://render.com)
3. Set environment variable: `ENABLE_URL_DOWNLOAD=false`
4. Deploy automatically!

#### 3. VPS with PM2

```bash
# On your VPS
git clone YOUR_REPO /opt/transcribe-app
cd /opt/transcribe-app

# Install and build
npm ci
cd client && npm ci && npm run build && cd ..

# Start with PM2
pm2 start server.js --name transcribe-app
pm2 save
pm2 startup

# Setup nginx reverse proxy (see DEPLOY.md)
```

**For detailed deployment instructions, see [DEPLOY.md](DEPLOY.md)**

## 📚 API Documentation

### POST `/api/transcribe-file`

Upload and transcribe audio/video file

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `audio`
- Max size: 500MB

**Response:**
```json
{
  "summary": "AI-enhanced summary...",
  "transcript": "Full timestamped transcript...",
  "filename": "uploaded-file.mp3"
}
```

### POST `/api/transcribe-url`

Transcribe from YouTube URL (if enabled)

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "summary": "AI-enhanced summary...",
  "transcript": "Full timestamped transcript...",
  "url": "https://www.youtube.com/..."
}
```

### GET `/api/health`

Health check endpoint

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-07T..."
}
```

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- FFmpeg (for audio processing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd transcribe
   ```

2. **Install dependencies:**
   ```bash
   npm run install-all
   ```

3. **Configure environment (IMPORTANT for real transcription):**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key:
   # OPENAI_API_KEY=sk-your-key-here
   ```

   **To get an OpenAI API key:**
   - Visit https://platform.openai.com/api-keys
   - Sign up/login to OpenAI
   - Create a new API key
   - Add it to your .env file
   
   **Without an API key:** The app will run in demo mode with placeholder transcripts.

4. **Start the application:**
   ```bash
   # Development mode (auto-reload)
   npm run dev
   
   # Or start both server and client separately:
   # Terminal 1: npm start (server on port 3001)
   # Terminal 2: cd client && npm run dev (client on port 3000)
   ```

5. **Open your browser:**
   - Development: http://localhost:3000
   - Production: http://localhost:3001

## Project Structure

```
transcribe/
├── client/                 # Frontend (Vite + Vanilla JS)
│   ├── index.html         # Main HTML file
│   ├── main.js           # JavaScript logic
│   ├── package.json      # Client dependencies
│   └── vite.config.js    # Vite configuration
├── server.js             # Express server
├── package.json          # Server dependencies
├── .env.example         # Environment template
└── README.md           # This file
```

## API Endpoints

### POST `/api/transcribe-file`
Transcribe uploaded audio/video file
- Content-Type: `multipart/form-data`
- Field name: `audio`
- Supported formats: MP3, MP4, WAV, M4A, MOV, AVI
- Max size: 500MB

### GET `/api/health`
Health check endpoint

## Development

### Running in Development Mode

```bash
# Start both server and client with auto-reload
npm run dev

# Or run separately:
# Terminal 1 (Backend):
npm start

# Terminal 2 (Frontend):
cd client
npm run dev
```

### Building for Production

```bash
# Build client
cd client
npm run build

# Start production server
npm start
```

## Configuration

### Speech-to-Text Services

The app currently uses a mock transcription service. For production, integrate with:

#### OpenAI Whisper (Recommended)
```bash
# Add to .env
OPENAI_API_KEY=your_api_key_here
```

#### Google Cloud Speech-to-Text
```bash
# Add to .env
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

#### Azure Speech Services
```bash
# Add to .env
AZURE_SPEECH_KEY=your_key
AZURE_SPEECH_REGION=your_region
```

### FFmpeg Installation

#### macOS (with Homebrew)
```bash
brew install ffmpeg
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```

#### Windows
1. Download from https://ffmpeg.org/download.html
2. Add to system PATH

## Deployment

### Environment Variables
```bash
PORT=3001
NODE_ENV=production
OPENAI_API_KEY=your_openai_key
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN cd client && npm ci && npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

1. **FFmpeg not found**
   - Install FFmpeg and ensure it's in your PATH
   - Check with: `ffmpeg -version`

2. **YouTube extraction fails**
   - Some videos may be restricted or require different extraction methods
   - Use the manual file upload as fallback

3. **Large file uploads fail**
   - Check file size limits in both client and server
   - Current limit: 100MB

4. **Port already in use**
   - Change PORT in .env file
   - Kill existing processes: `lsof -ti:3001 | xargs kill`

### Development Tips

- Use browser dev tools to debug API calls
- Check server logs for detailed error messages
- Monitor temp folder for file cleanup issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review server logs
3. Create an issue with detailed information