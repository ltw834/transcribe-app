#!/bin/bash
# Quick publish script for Transcribe App

set -e  # Exit on error

echo "🚀 Transcribe App - Publish Script"
echo "=================================="
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }

echo "✅ Prerequisites check passed"
echo ""

# Check if .env exists and has no sensitive data
if [ -f .env ]; then
    echo "⚠️  WARNING: .env file exists"
    echo "   Make sure it's in .gitignore and won't be committed!"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci
cd client && npm ci && cd ..
echo "✅ Dependencies installed"
echo ""

# Build client
echo "🔨 Building client..."
cd client && npm run build && cd ..
if [ ! -f "client/dist/index.html" ]; then
    echo "❌ Build failed - client/dist/index.html not found"
    exit 1
fi
echo "✅ Client built successfully"
echo ""

# Check for common issues
echo "🔍 Running pre-publish checks..."

# Check if .env is in .gitignore
if ! grep -q "^\.env$" .gitignore; then
    echo "⚠️  WARNING: .env is not in .gitignore - adding it now"
    echo ".env" >> .gitignore
fi

# Check for exposed secrets in git history
if git rev-parse --git-dir > /dev/null 2>&1; then
    if git log --all --full-history --source -- .env 2>/dev/null | grep -q .; then
        echo "⚠️  WARNING: .env found in git history!"
        echo "   You should remove it from history before publishing"
        echo "   Run: git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all"
    fi
fi

echo "✅ Pre-publish checks complete"
echo ""

# Show next steps
echo "🎉 Ready to publish!"
echo ""
echo "Next steps:"
echo "==========="
echo ""
echo "1. Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for production deployment'"
echo "   git push origin main"
echo ""
echo "2. Choose your deployment method:"
echo ""
echo "   A. Docker (Recommended):"
echo "      - Ensure Docker is installed and running"
echo "      - Run: docker build -t transcribe-app:latest ."
echo "      - Run: docker-compose up -d"
echo "      - Or push to Docker Hub and deploy on VPS"
echo ""
echo "   B. Railway/Render (Easiest):"
echo "      - Connect your GitHub repo to Railway or Render"
echo "      - Set ENABLE_URL_DOWNLOAD=false in environment"
echo "      - Deploy automatically from main branch"
echo ""
echo "   C. VPS with PM2:"
echo "      - SSH into your VPS"
echo "      - Clone repo: git clone YOUR_REPO /opt/transcribe-app"
echo "      - Run: npm ci && cd client && npm ci && npm run build"
echo "      - Run: pm2 start server.js --name transcribe-app"
echo "      - Setup nginx reverse proxy (see DEPLOY.md)"
echo ""
echo "3. Configure environment variables:"
echo "   ENABLE_URL_DOWNLOAD=false  (recommended for production)"
echo "   NODE_ENV=production"
echo ""
echo "4. Setup HTTPS:"
echo "   - Use certbot with nginx, or"
echo "   - Use platform-managed TLS (Railway/Render)"
echo ""
echo "For detailed instructions, see DEPLOY.md"
echo ""
