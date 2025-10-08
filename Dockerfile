# Production Dockerfile for Transcribe App
FROM node:18-bullseye-slim

# Install system dependencies: ffmpeg for audio processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    ca-certificates \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Verify ffmpeg installation
RUN ffmpeg -version

WORKDIR /app

# Copy package files for dependency installation (layer caching)
COPY package*.json ./
COPY client/package*.json ./client/

# Install production dependencies
RUN npm ci --omit=dev
RUN cd client && npm ci

# Copy application source
COPY . .

# Build client for production
RUN cd client && npm run build

# Create temp directory for file uploads
RUN mkdir -p temp

# Environment configuration
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run as non-root user for security
RUN useradd -m -u 1001 appuser && chown -R appuser:appuser /app
USER appuser

# Start server
CMD ["node", "server.js"]
