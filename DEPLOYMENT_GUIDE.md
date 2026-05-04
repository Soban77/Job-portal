# Deployment Guide - Job Portal

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Local Deployment](#local-deployment)
4. [Render.com Deployment](#rendercom-deployment)
5. [Heroku Deployment](#heroku-deployment)
6. [Docker Deployment](#docker-deployment)
7. [AWS Deployment](#aws-deployment)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Monitoring & Logging](#monitoring--logging)
10. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production:

- [x] All tests passing (`npm test`)
- [x] No console errors or warnings
- [x] Environment variables documented
- [x] Database backup created
- [x] SSL certificate ready (for production)
- [x] Domain name configured
- [x] Email credentials verified
- [x] Upload directory configured
- [x] Cache strategy tested
- [x] Error handling verified

```bash
# Run pre-deployment checks
npm test
npm run lint  # if available
npm run build # if available
```

---

## Environment Configuration

### Production .env Template

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration (Atlas recommended)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/job_portal?retryWrites=true&w=majority

# Redis Configuration (Upstash or Redis Cloud)
REDIS_URL=redis://default:password@redis-host:6379

# JWT Configuration (Strong secret key required!)
JWT_SECRET=your-very-long-and-random-secret-key-at-least-32-characters

# Email Configuration (Gmail or SendGrid)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# API Gateway
API_GATEWAY_URL=https://yourdomain.com

# Application Configuration
APP_NAME=Job Portal
APP_VERSION=1.0.0
ENVIRONMENT=production
```

### Security Notes:
- **JWT_SECRET:** Generate using `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **EMAIL_PASS:** Use app-specific password (NOT regular password)
- **MONGO_URI:** Use connection string from MongoDB Atlas
- **REDIS_URL:** Use managed Redis service (Upstash recommended)

---

## Local Deployment

### Development Environment

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env with local values

# 3. Ensure MongoDB is running
mongod

# 4. Ensure Redis is running (optional)
redis-server

# 5. Start development server
npm run dev

# 6. Access application
# Frontend: http://localhost:5000
# API Docs: http://localhost:5000/api-docs
```

### Testing Locally

```bash
# Run unit tests
npm test

# Run specific test file
npm test -- tests/api.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## Render.com Deployment

Render is a modern cloud platform with free tier support.

### Step 1: Prepare Repository

```bash
# Ensure .env.example is in repo
# Ensure package.json has "start" script
# Ensure .gitignore excludes .env and node_modules
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Create Render Service

1. Go to [render.com](https://render.com)
2. Sign up and log in
3. Click "New +" → "Web Service"
4. Connect GitHub repository
5. Select repository
6. Configure:
   - **Name:** job-portal
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free or paid

### Step 3: Add Environment Variables

In Render dashboard:
1. Go to "Environment" tab
2. Add each variable from production .env:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGO_URI=<your-atlas-url>`
   - `REDIS_URL=<your-redis-url>`
   - `JWT_SECRET=<your-secret>`
   - `EMAIL_SERVICE=gmail`
   - `EMAIL_USER=<your-email>`
   - `EMAIL_PASS=<your-password>`

### Step 4: Configure Database & Cache

**MongoDB Atlas:**
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Add to `MONGO_URI` in Render

**Redis (Upstash):**
1. Go to [upstash.com](https://upstash.com)
2. Create Redis database
3. Get connection URL
4. Add to `REDIS_URL` in Render

### Step 5: Deploy

```bash
# Automatic deployment on git push
git push origin main
# Render automatically deploys!
```

### Step 6: Verify Deployment

```bash
# Check logs
# In Render dashboard → Logs tab

# Test API
curl https://your-app.onrender.com/api/login

# Access frontend
# https://your-app.onrender.com
```

---

## Heroku Deployment

Heroku is popular but paid after March 2025.

### Step 1: Install Heroku CLI

```bash
# macOS
brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Verify installation
heroku --version
```

### Step 2: Login to Heroku

```bash
heroku login
# Opens browser for authentication
```

### Step 3: Create Heroku App

```bash
heroku create your-app-name
# Or let Heroku generate name: heroku create
```

### Step 4: Add Procfile

Create `Procfile` in root directory:

```
web: npm start
```

### Step 5: Set Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set MONGO_URI=mongodb+srv://...
heroku config:set REDIS_URL=redis://...
heroku config:set EMAIL_SERVICE=gmail
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password

# Verify
heroku config
```

### Step 6: Deploy

```bash
git push heroku main
# Or: git push heroku master
```

### Step 7: View Logs

```bash
heroku logs --tail
```

### Step 8: Open App

```bash
heroku open
# Opens https://your-app-name.herokuapp.com
```

---

## Docker Deployment

Docker containerizes your application for easy deployment.

### Step 1: Create Dockerfile

```dockerfile
# Use Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

### Step 2: Create .dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.example
README.md
uploads
```

### Step 3: Build Docker Image

```bash
docker build -t job-portal:latest .
```

### Step 4: Run Container Locally

```bash
docker run \
  -p 5000:5000 \
  -e MONGO_URI=mongodb://localhost:27017/job_portal \
  -e REDIS_URL=redis://localhost:6379 \
  -e JWT_SECRET=your-secret \
  job-portal:latest
```

### Step 5: Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Tag image
docker tag job-portal:latest username/job-portal:latest

# Push image
docker push username/job-portal:latest
```

### Step 6: Deploy to Production

Use Docker Compose or container orchestration:

```bash
docker pull username/job-portal:latest
docker run -d \
  -p 80:5000 \
  --name job-portal \
  -e MONGO_URI=<production-uri> \
  -e REDIS_URL=<production-redis> \
  username/job-portal:latest
```

---

## AWS Deployment

### Using EC2 + RDS

#### Step 1: Launch EC2 Instance

```bash
# On AWS Console:
# 1. EC2 → Launch Instance
# 2. Select Ubuntu 20.04 LTS
# 3. Instance type: t2.micro (free tier)
# 4. Configure security groups
# 5. Create/use key pair
# 6. Launch
```

#### Step 2: Connect to Instance

```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

#### Step 3: Install Dependencies

```bash
sudo apt update
sudo apt install nodejs npm mongodb redis-server

# Start services
sudo systemctl start mongodb
sudo systemctl start redis-server
```

#### Step 4: Deploy Application

```bash
git clone your-repo
cd job-portal
npm install
npm run build
npm start
```

#### Step 5: Setup RDS Database

```bash
# Use AWS RDS for MongoDB or create Atlas connection
# Update MONGO_URI in environment
```

#### Step 6: Setup ElastiCache for Redis

```bash
# Use AWS ElastiCache for Redis
# Update REDIS_URL in environment
```

---

## Post-Deployment Verification

### API Endpoints Check

```bash
# Health check
curl https://your-app.onrender.com/

# API docs
curl https://your-app.onrender.com/api-docs

# Register
curl -X POST https://your-app.onrender.com/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123","role":"seeker"}'

# Login
curl -X POST https://your-app.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

### Frontend Check

```bash
# Open in browser
https://your-app.onrender.com

# Verify pages load
# - Home page (/)
# - Login works
# - Registration works
# - Dashboard accessible after login
```

### Database Verification

```bash
# MongoDB Atlas
# Go to Collections → Verify data is present

# Redis
# Use Redis CLI: redis-cli ping
# Should return PONG
```

### Performance Check

```bash
# Test cache
curl https://your-app.onrender.com/job
# Second request should be faster

# Check response headers
curl -I https://your-app.onrender.com/
```

---

## Monitoring & Logging

### Application Logs

```bash
# Render
# Dashboard → Logs tab

# Heroku
heroku logs --tail

# Docker
docker logs -f container-id
```

### Database Monitoring

**MongoDB Atlas:**
1. Go to Atlas dashboard
2. Monitor → Monitoring
3. Check metrics: connections, operations, storage

**Redis Cloud/Upstash:**
1. Go to provider dashboard
2. Monitor → Overview
3. Check metrics: memory, operations, throughput

### Error Tracking

Setup error tracking service:
- [Sentry](https://sentry.io) - Error tracking
- [Loggly](https://www.loggly.com) - Log aggregation
- [DataDog](https://www.datadoghq.com) - Full monitoring

### Performance Monitoring

```bash
# Add to index.js for response time tracking
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});
```

---

## Scaling Strategy

### Horizontal Scaling

```bash
# Multiple server instances behind load balancer
# Use container orchestration: Kubernetes, Docker Swarm
# Load balancing: Nginx, HAProxy
```

### Vertical Scaling

```bash
# Increase server resources
# RAM: More cache hits
# CPU: Faster processing
# Storage: More files
```

### Caching Optimization

```bash
# Implement multi-layer caching
# 1. Browser cache (HTTP headers)
# 2. CDN cache (CloudFlare, Akamai)
# 3. Redis cache (session, job searches)
# 4. Database query cache
```

---

## Backup & Recovery

### Database Backup

**MongoDB Atlas:**
```bash
# Automated backups enabled by default
# Manual backup:
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/job_portal"

# Restore:
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/job_portal" dump/
```

### File Backup

```bash
# Backup uploads directory
tar -czf uploads-backup.tar.gz uploads/

# Restore
tar -xzf uploads-backup.tar.gz
```

---

## Troubleshooting Deployment Issues

### App Won't Start

```bash
# Check logs
heroku logs --tail  # Heroku
docker logs container-id  # Docker

# Check environment variables
heroku config  # Heroku

# Verify package.json has start script
cat package.json | grep '"start"'
```

### Database Connection Failed

```bash
# Verify connection string
echo $MONGO_URI

# Test connection
mongo "your-connection-string"

# Check IP whitelist in MongoDB Atlas
# Add deployment server IP to whitelist
```

### Redis Connection Failed

```bash
# Verify connection URL
echo $REDIS_URL

# Test connection
redis-cli -u "$REDIS_URL" ping
```

### Email Not Sending

```bash
# Verify credentials
echo $EMAIL_USER
echo $EMAIL_PASS

# Use app-specific password (not regular password)
# For Gmail: https://myaccount.google.com/apppasswords
```

### Port Already in Use

```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change PORT in .env
```

### Static Files Not Serving

```bash
# Ensure Frontend folder exists
ls Frontend/

# Check index.js has static middleware
# app.use(express.static('Frontend'));

# Verify CSS/JS files exist
ls Frontend/Scripts/
```

---

## SSL/HTTPS Setup

### Using Render (Automatic)

- Render automatically provisions SSL certificate
- HTTPS enabled by default
- No additional configuration needed

### Using Heroku

```bash
# Add free SSL
heroku certs:auto:enable

# Verify
heroku certs
```

### Using Let's Encrypt (Docker/VPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Configure Nginx to use certificate
```

---

## Continuous Integration/Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Test
        run: |
          npm install
          npm test
      
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

## Production Checklist

Before going live:

- [ ] SSL certificate installed
- [ ] Database backups automated
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Logging aggregated
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] Email service tested
- [ ] File upload working
- [ ] Cache warming configured
- [ ] Health check endpoint ready
- [ ] Incident response plan ready

---

## Support & Resources

- [Render Documentation](https://render.com/docs)
- [Heroku Documentation](https://devcenter.heroku.com)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Redis Cloud Documentation](https://docs.redis.com/latest/rc/)
- [Docker Documentation](https://docs.docker.com)
- [AWS Documentation](https://docs.aws.amazon.com)

---

**Deployment Guide Version:** 1.0  
**Last Updated:** May 2, 2026  
**Status:** Production Ready