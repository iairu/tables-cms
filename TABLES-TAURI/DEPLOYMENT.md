# TABLES CMS - Deployment Guide

Complete guide for deploying TABLES CMS to Vercel and other platforms.

## Table of Contents

1. [Quick Deploy](#quick-deploy)
2. [Manual Deployment](#manual-deployment)
3. [Vercel Configuration](#vercel-configuration)
4. [Environment Variables](#environment-variables)
5. [Custom Domain Setup](#custom-domain-setup)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Troubleshooting](#troubleshooting)

## Quick Deploy

### Option 1: Vercel One-Click Deploy

Click the button below to deploy instantly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/iairu/tables-cms)

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Manual Deployment

### Step 1: Prepare Your Project

```bash
# Navigate to project
cd TABLES-TAURI

# Install dependencies
npm install

# Verify installation
npm run build:ssg
```

### Step 2: Build Static Site

```bash
# Generate static files
npm run build:ssg

# This creates:
# - dist/index.html
# - dist/pages/*.html
# - dist/blog/*.html
# - dist/assets/*
# - dist/cms/*.json
```

### Step 3: Deploy to Vercel

```bash
# Using Vercel CLI
vercel --prod

# Or drag and drop the dist folder to vercel.com
```

### Step 4: Configure Domain

1. Go to your Vercel project
2. Navigate to Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed

## Vercel Configuration

### vercel.json

The project includes a pre-configured `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build:ssg",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": { "cache-control": "public, max-age=31536000, immutable" },
      "continue": true
    },
    {
      "src": "/cms/(.*)",
      "headers": { "cache-control": "public, max-age=60, must-revalidate" },
      "continue": true
    },
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Build Settings

In Vercel dashboard:

1. **Build Command:** `npm run build:ssg`
2. **Output Directory:** `dist`
3. **Install Command:** `npm install`

## Environment Variables

Set these in your Vercel project settings (Settings → Environment Variables):

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VERCEL_API_KEY` | Vercel API key for deployments | `...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_VERSION` | Node.js version | `18` |
| `NPM_FLAGS` | npm flags | `--legacy-peer-deps` |

### Setting Environment Variables

```bash
# Using Vercel CLI
vercel env add VERCEL_API_KEY

# Or in vercel.json
{
  "env": {
    "VERCEL_API_KEY": "@vercel-api-key"
  }
}
```

## Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your domain (e.g., `example.com`)

### Step 2: Configure DNS

**For Root Domain (`example.com`):**

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |

**For Subdomain (`www.example.com`):**

| Type | Name | Value |
|------|------|-------|
| CNAME | www | `cname.vercel.com` |

### Step 3: SSL Certificate

Vercel automatically provisions SSL certificates. No action needed.

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build static site
        run: npm run build:ssg
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### GitLab CI/CD

Create `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  image: node:18
  script:
    - npm install
    - npm run build:ssg
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache curl
    - curl -L "https://vercel.com/cli" | sh
    - ./vercel --prod --token=$VERCEL_TOKEN
  only:
    - main
```

## Troubleshooting

### Build Fails

**Issue:** `npm run build:ssg` fails

**Solution:**
```bash
# Clear cache
rm -rf node_modules dist package-lock.json

# Reinstall
npm install

# Try again
npm run build:ssg
```

### Deployment Fails

**Issue:** Vercel deployment fails

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify `vercel.json` syntax
3. Ensure all dependencies are in `package.json`
4. Check environment variables

### 404 Errors

**Issue:** Pages return 404 after deployment

**Solution:**
1. Verify `dist/` folder contains all files
2. Check routing configuration in `vercel.json`
3. Ensure SSG build completed successfully

### API Routes Not Working

**Issue:** `/api/*` routes return 404

**Solution:**
1. Verify API files are in `api/` folder
2. Check `vercel.json` routes configuration
3. Ensure proper export syntax in API files

## Performance Optimization

### Enable Caching

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Enable Compression

Vercel automatically compresses responses using gzip and Brotli.

### Use Edge Functions

For dynamic content, consider using Vercel Edge Functions:

```javascript
// api/edge.js
export const config = {
  runtime: 'edge'
};

export default function handler(req) {
  return new Response('Hello from Edge!');
}
```

## Monitoring

### Vercel Analytics

Enable Vercel Analytics in your project settings for:
- Page views
- Web Vitals
- Geographic data

### Custom Analytics

Add Google Analytics or other analytics to your site:

```html
<!-- Add to index.html or layout -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Security Best Practices

### Content Security Policy

Add CSP headers to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

### Rate Limiting

For API routes, implement rate limiting:

```javascript
// api/protected.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

export default function handler(req, res) {
  limiter(req, res, () => {
    // Handle request
  });
}
```

## Support

For additional help:
- [Vercel Documentation](https://vercel.com/docs)
- [TABLES CMS Issues](https://github.com/iairu/tables-cms/issues)
- [Community Discord](https://discord.gg/vercel)

---

Last updated: March 2026
