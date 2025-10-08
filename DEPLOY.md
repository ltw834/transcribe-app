# 🚀 Deployment Guide - Transcribe App

Complete guide to deploying your transcription app to production.

## Table of Contents
- [Quick Deploy Options](#quick-deploy-options)
- [Docker Deployment](#docker-deployment)
- [VPS Deployment](#vps-deployment)
- [Platform-as-a-Service (PaaS)](#platform-as-a-service)
- [Security Checklist](#security-checklist)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## Quick Deploy Options

### Option 1: Docker (Recommended)
Best for: Reproducible, portable deployments on any VPS or cloud platform

```bash
# Build and run locally
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 2: Railway/Render (Easiest)
Best for: Quick deployment with managed infrastructure

1. Push code to GitHub
2. Connect Railway/Render to your repo
3. Set environment variables
4. Deploy!

### Option 3: VPS with systemd
Best for: Full control, cost optimization

See [VPS Deployment](#vps-deployment) below.

---

## Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- Domain name (optional, for HTTPS)

### Step 1: Build the Image

```bash
# Build Docker image
docker build -t transcribe-app:latest .

# Test locally
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e ENABLE_URL_DOWNLOAD=false \
  transcribe-app:latest
```

### Step 2: Deploy with docker-compose

```bash
# Create .env file for docker-compose
cat > .env << EOF
ENABLE_URL_DOWNLOAD=false
NODE_ENV=production
PORT=3001
EOF

# Start services
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

### Step 3: Publish to Docker Hub (Optional)

```bash
# Login to Docker Hub
docker login

# Tag image
docker tag transcribe-app:latest YOUR_USERNAME/transcribe-app:latest

# Push
docker push YOUR_USERNAME/transcribe-app:latest
```

### Step 4: Deploy on VPS

```bash
# On your VPS:
# 1. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. Pull and run
docker pull YOUR_USERNAME/transcribe-app:latest
docker run -d -p 3001:3001 \
  --name transcribe \
  --restart unless-stopped \
  -e NODE_ENV=production \
  -e ENABLE_URL_DOWNLOAD=false \
  -v /opt/transcribe/temp:/app/temp \
  YOUR_USERNAME/transcribe-app:latest
```

---

## VPS Deployment

### Prerequisites
- Ubuntu 20.04+ or similar Linux VPS
- Domain name pointed to your VPS IP
- SSH access

### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install FFmpeg
sudo apt install -y ffmpeg

# Install PM2 (process manager)
sudo npm install -g pm2

# Install nginx
sudo apt install -y nginx

# Install certbot for HTTPS
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Clone and Build

```bash
# Clone your repository
cd /opt
sudo git clone YOUR_REPO_URL transcribe-app
cd transcribe-app

# Install dependencies
sudo npm ci
cd client && sudo npm ci && sudo npm run build && cd ..

# Create .env file
sudo cp .env.example .env
sudo nano .env  # Edit configuration
```

### Step 3: Start with PM2

```bash
# Start application
sudo pm2 start server.js --name transcribe-app

# Save PM2 configuration
sudo pm2 save

# Setup PM2 to start on boot
sudo pm2 startup systemd
# Follow the command output instructions

# Check status
sudo pm2 status
sudo pm2 logs transcribe-app
```

### Step 4: Configure Nginx

```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/transcribe

# Edit with your domain
sudo nano /etc/nginx/sites-available/transcribe
# Replace 'your-domain.com' with your actual domain

# Enable site
sudo ln -s /etc/nginx/sites-available/transcribe /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 5: Setup HTTPS with Let's Encrypt

```bash
# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot will automatically configure nginx
# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Platform-as-a-Service

### Railway

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Railway**
   - Visit [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Railway will auto-detect the Dockerfile

3. **Configure Environment Variables**
   ```
   NODE_ENV=production
   ENABLE_URL_DOWNLOAD=false
   PORT=3001
   ```

4. **Add Domain** (optional)
   - Go to Settings → Domains
   - Add custom domain or use Railway's subdomain

### Render

1. **Push to GitHub** (same as above)

2. **Create New Web Service**
   - Visit [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your repository

3. **Configure Build**
   - **Environment**: Docker
   - **Docker Command**: (leave default)
   - **Region**: Choose closest to users

4. **Environment Variables**
   ```
   NODE_ENV=production
   ENABLE_URL_DOWNLOAD=false
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically

### Heroku

```bash
# Install Heroku CLI
# Visit: https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-app-name

# Add buildpack
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set ENABLE_URL_DOWNLOAD=false

# Deploy
git push heroku main

# Open app
heroku open
```

---

## Security Checklist

### Before Going Live

- [ ] **Remove secrets from code**
  ```bash
  # Check for exposed secrets
  git log --all --full-history --source -- .env
  grep -r "sk-" . --exclude-dir=node_modules
  ```

- [ ] **Update .env with production values**
  ```bash
  cp .env.example .env
  # Edit .env with secure values
  # NEVER commit .env to git
  ```

- [ ] **Set ENABLE_URL_DOWNLOAD=false** (recommended)
  - Avoids legal/copyright issues with YouTube downloads

- [ ] **Enable rate limiting** (already configured in server.js)

- [ ] **Setup HTTPS/TLS** 
  - Use Let's Encrypt (free) or platform-managed TLS

- [ ] **Configure firewall**
  ```bash
  # Ubuntu with ufw
  sudo ufw allow 22    # SSH
  sudo ufw allow 80    # HTTP
  sudo ufw allow 443   # HTTPS
  sudo ufw enable
  ```

- [ ] **Setup log rotation**
  ```bash
  # PM2 handles this automatically
  # Or configure logrotate
  sudo nano /etc/logrotate.d/transcribe-app
  ```

- [ ] **Add health monitoring**
  - Use UptimeRobot, Pingdom, or similar
  - Monitor: https://your-domain.com/api/health

- [ ] **Setup backups** (if storing user data)

- [ ] **Review CORS settings** in server.js
  - Restrict origins in production if needed

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check application health
curl https://your-domain.com/api/health

# Expected response:
# {"status":"OK","timestamp":"2025-10-07T..."}
```

### View Logs

**PM2:**
```bash
sudo pm2 logs transcribe-app
sudo pm2 logs transcribe-app --lines 100
```

**Docker:**
```bash
docker logs transcribe
docker logs -f transcribe  # Follow
```

**systemd:**
```bash
sudo journalctl -u transcribe-app -f
```

### Restart Application

**PM2:**
```bash
sudo pm2 restart transcribe-app
```

**Docker:**
```bash
docker restart transcribe
# or
docker-compose restart
```

### Update Application

**PM2/VPS:**
```bash
cd /opt/transcribe-app
sudo git pull
sudo npm ci
cd client && sudo npm ci && sudo npm run build && cd ..
sudo pm2 restart transcribe-app
```

**Docker:**
```bash
# Rebuild image
docker-compose build --no-cache

# Restart services
docker-compose up -d
```

### Monitor Resources

```bash
# PM2 monitoring
sudo pm2 monit

# Docker stats
docker stats transcribe

# System resources
htop
df -h  # Disk space
```

### Clean Up Temp Files

```bash
# Manual cleanup
find /app/temp -type f -mtime +1 -delete

# Or add to crontab
sudo crontab -e
# Add: 0 2 * * * find /opt/transcribe-app/temp -type f -mtime +1 -delete
```

---

## Troubleshooting

### Application won't start

```bash
# Check logs
pm2 logs transcribe-app --err

# Check if port is in use
sudo lsof -i :3001

# Check FFmpeg
ffmpeg -version

# Check environment
cat .env
```

### High memory usage

```bash
# Check running processes
pm2 list

# Set memory limit (PM2)
pm2 start server.js --max-memory-restart 1G

# Docker resource limits (already in docker-compose.yml)
```

### SSL certificate issues

```bash
# Renew certificate
sudo certbot renew

# Check expiry
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

---

## Cost Estimation

### Minimal Setup (< $10/month)
- VPS: DigitalOcean droplet ($5-6/mo)
- Domain: Namecheap (~$10-15/year)
- Total: ~$6-7/month

### Platform-as-a-Service
- Railway: ~$5/month (Pay-as-you-go)
- Render: Free tier available, paid starts at $7/mo
- Heroku: $7/month (Eco dyno)

### Production Setup ($20-50/month)
- VPS: 2GB RAM, 2 vCPU ($12-20/mo)
- Domain: $10-15/year
- Monitoring: Free tier (UptimeRobot)
- Backups: VPS snapshots ($1-2/mo)

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Choose deployment method
3. ✅ Set environment variables
4. ✅ Deploy and test
5. ✅ Configure custom domain & HTTPS
6. ✅ Setup monitoring
7. ✅ Document for your team

Need help? Check the main README.md or open an issue!
