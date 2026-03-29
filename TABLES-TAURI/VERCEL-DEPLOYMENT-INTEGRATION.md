# TABLES CMS - Vercel Deployment Integration

**Document Created:** March 29, 2026  
**Last Updated:** March 29, 2026

---

## Executive Summary

TABLES-TAURI now includes comprehensive Vercel deployment integration with:
- Full SSG (Static Site Generation) build pipeline
- One-click deployment from the CMS interface
- Real-time build status tracking
- Automatic SEO optimization (Open Graph, Twitter Cards, Schema.org)
- Sitemap and robots.txt generation
- PWA support with web manifest
- Webhook support for automated deployments

---

## Table of Contents

1. [Features Overview](#features-overview)
2. [Tauri Backend Commands](#tauri-backend-commands)
3. [SSG Build System](#ssg-build-system)
4. [Vercel Configuration](#vercel-configuration)
5. [Deployment Workflow](#deployment-workflow)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)

---

## Features Overview

### ✅ Implemented Features

| Feature | Status | Description |
|---------|--------|-------------|
| SSG Build | ✅ Complete | Generates static HTML from CMS data |
| Vercel CLI Integration | ✅ Complete | Deploys via Vercel CLI |
| Webhook Support | ✅ Complete | Trigger deployments via webhooks |
| Build Status Tracking | ✅ Complete | Real-time build/deployment status |
| Build Logs | ✅ Complete | View build logs in real-time |
| SEO Meta Tags | ✅ Complete | Open Graph, Twitter Cards, Schema.org |
| Sitemap Generation | ✅ Complete | Automatic sitemap.xml |
| Robots.txt | ✅ Complete | Automatic robots.txt |
| PWA Support | ✅ Complete | site.webmanifest generation |
| Theme Persistence | ✅ Complete | Preserves selected theme |

---

## Tauri Backend Commands

### Available Commands

The following Rust commands are available in the Tauri backend:

#### `trigger_build()`
Triggers a local SSG build without deployment.

**Returns:** `String` - Build status message

#### `trigger_deploy(app, vercel_api_key, vercel_project_id)`
Builds and deploys to Vercel.

**Parameters:**
- `app: tauri::AppHandle` - Application handle for events
- `vercel_api_key: String` - Vercel API token
- `vercel_project_id: String` - Vercel project ID

**Returns:** `String` - Deployment result with URL

**Events Emitted:**
- `deployment-complete` - Fired when deployment succeeds
  - Payload: `{ url: string, id: string }`

#### `get_deployment_status()`
Returns current deployment status.

**Returns:** `DeploymentStatus`
```rust
pub struct DeploymentStatus {
    pub is_deploying: bool,
    pub last_deployment: Option<u64>,
    pub deployment_id: Option<String>,
    pub deployment_url: Option<String>,
    pub build_logs: Vec<String>,
}
```

#### `get_build_logs()`
Returns build logs array.

**Returns:** `Vec<String>` - Array of log messages

#### `clear_build_logs()`
Clears the build logs.

**Returns:** `Result<(), String>`

#### `trigger_vercel_webhook(webhook_url)`
Triggers a Vercel deployment webhook.

**Parameters:**
- `webhook_url: String` - Vercel webhook URL

**Returns:** `String` - Webhook result

---

## SSG Build System

### Build Script Location
`scripts/ssg-build.js`

### Build Process

1. **Clean dist directory** - Removes previous build artifacts
2. **Copy assets** - Copies static assets to dist
3. **Copy CMS data** - Copies JSON data files
4. **Generate CSS/JS** - Creates runtime assets
5. **Generate pages** - Creates HTML for each page
6. **Generate blog articles** - Creates HTML for blog posts
7. **Generate sitemap.xml** - SEO sitemap
8. **Generate robots.txt** - Search engine directives
9. **Generate site.webmanifest** - PWA support

### Output Structure

```
dist/
├── index.html              # Home page
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Search engine rules
├── site.webmanifest        # PWA manifest
├── cms/                    # CMS data (JSON)
│   ├── pages.json
│   ├── blogArticles.json
│   ├── settings.json
│   └── ...
├── assets/                 # Static assets
│   ├── css/
│   │   └── main.css
│   ├── js/
│   │   └── main.js
│   └── [images, fonts, etc.]
└── blog/                   # Blog articles
    ├── index.html
    ├── article-slug-1.html
    └── article-slug-2.html
```

### SEO Features

Each generated page includes:

#### Meta Tags
- Title with site name
- Description
- Author
- Canonical URL
- Robots directives

#### Open Graph Tags
- og:type
- og:url
- og:title
- og:description
- og:image
- og:site_name
- og:locale

#### Twitter Cards
- twitter:card
- twitter:url
- twitter:title
- twitter:description
- twitter:image
- twitter:site (if configured)

#### Schema.org JSON-LD
- Article or WebPage type
- Author information
- Publication dates
- Publisher details

---

## Vercel Configuration

### vercel.json

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
      "headers": { 
        "cache-control": "public, max-age=31536000, immutable" 
      },
      "continue": true
    },
    {
      "src": "/cms/(.*)",
      "headers": { 
        "cache-control": "public, max-age=60, must-revalidate" 
      },
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

### Environment Variables

Set these in Vercel dashboard or `.env.local`:

| Variable | Description | Required |
|----------|-------------|----------|
| `VERCEL_API_KEY` | Vercel API token for deployments | ✅ Yes |
| `VERCEL_PROJECT_ID` | Vercel project ID | ✅ Yes |
| `VERCEL_ORG_ID` | Vercel organization ID | ❌ No |
| `NODE_VERSION` | Node.js version (default: 18) | ❌ No |

### Getting Vercel API Token

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Select "Full Access" or create a custom token
4. Copy the token and save it securely

---

## Deployment Workflow

### From CMS Interface

1. **Configure Vercel Settings**
   - Go to Settings → Deployment
   - Enter Vercel API Key
   - Enter Vercel Project ID
   - Save settings

2. **Build & Deploy**
   - Click "Deploy" button in header
   - Watch build progress in console
   - View deployment URL when complete

### From CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Build locally
npm run build:ssg

# Deploy
vercel --prod

# Or with token
vercel --prod --token YOUR_TOKEN
```

### Automated Deployment (CI/CD)

#### GitHub Actions

```yaml
name: Deploy to Vercel

on:
  push:
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
      
      - name: Build SSG
        run: npm run build:ssg
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## API Reference

### Frontend → Backend Communication

```javascript
import { invoke } from '@tauri-apps/api/core';

// Trigger build
const result = await invoke('trigger_build');

// Trigger deployment
const deployResult = await invoke('trigger_deploy', {
  vercelApiKey: 'your-api-key',
  vercelProjectId: 'your-project-id'
});

// Get deployment status
const status = await invoke('get_deployment_status');

// Get build logs
const logs = await invoke('get_build_logs');

// Clear build logs
await invoke('clear_build_logs');

// Trigger webhook
const webhookResult = await invoke('trigger_vercel_webhook', {
  webhookUrl: 'https://api.vercel.com/v1/integrations/deploy/...'
});
```

### Event Listeners

```javascript
import { listen } from '@tauri-apps/api/event';

// Listen for deployment complete
await listen('deployment-complete', (event) => {
  console.log('Deployment URL:', event.payload.url);
  console.log('Deployment ID:', event.payload.id);
});
```

---

## Settings Integration

### Deployment Settings Tab

Located in Settings → Deployment:

- **Vercel API Key** - Secure token storage
- **Vercel Project ID** - Project identifier
- **Auto-build on Save** - Trigger build when content changes
- **Build Cooldown** - Prevent rapid successive builds
- **Deployment Webhook** - Alternative webhook URL

### Social Media Settings Tab

Located in Settings → Social Media:

- **Facebook URL** - For Open Graph
- **Twitter Handle** - For Twitter Cards
- **Instagram URL** - For social links
- **YouTube URL** - For social links
- **LinkedIn URL** - For social links
- **Enable Open Graph** - Toggle OG tags
- **Enable Twitter Cards** - Toggle Twitter tags

### Language Settings Tab

Located in Settings → Languages:

- **Default Language** - Site default locale
- **Supported Languages** - Multi-language support
- **Auto-translation** - Machine translation suggestions

---

## Troubleshooting

### Build Fails

**Error:** `npm run build:ssg` fails

**Solutions:**
1. Check Node.js version (requires 18+)
2. Clear node_modules and reinstall
3. Verify all dependencies in package.json
4. Check build logs for specific errors

```bash
rm -rf node_modules dist package-lock.json
npm install
npm run build:ssg
```

### Deployment Fails

**Error:** Vercel deployment fails

**Solutions:**
1. Verify Vercel API key is valid
2. Check Vercel project ID
3. Ensure Vercel CLI is installed: `npm install -g vercel`
4. Check Vercel dashboard for deployment logs

### 404 Errors After Deploy

**Solutions:**
1. Verify dist/ folder contains all files
2. Check vercel.json routes configuration
3. Ensure sitemap.xml is accessible at /sitemap.xml
4. Verify robots.txt allows crawling

### Build Takes Too Long

**Solutions:**
1. Enable build caching in Vercel
2. Reduce image sizes in uploads
3. Limit number of pages generated at once
4. Use incremental static regeneration (ISR)

---

## Performance Optimization

### Caching Strategy

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
    },
    {
      "source": "/cms/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=60, must-revalidate"
        }
      ]
    }
  ]
}
```

### Image Optimization

Vercel automatically optimizes images. Use the Next.js Image component or Vercel Image Optimization API for best results.

### Edge Functions

For dynamic content, consider using Vercel Edge Functions:

```javascript
// api/edge.js
export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  return new Response('Hello from Edge!');
}
```

---

## Security Best Practices

### Content Security Policy

Add to vercel.json:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
        }
      ]
    }
  ]
}
```

### API Key Protection

- Never commit API keys to version control
- Use environment variables
- Rotate keys periodically
- Use Vercel's encrypted secrets

---

## Monitoring & Analytics

### Vercel Analytics

Enable in Vercel dashboard for:
- Page views
- Web Vitals (LCP, FID, CLS)
- Geographic distribution
- Device breakdown

### Custom Analytics

Add to your site:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [TABLES CMS Issues](https://github.com/iairu/tables-cms/issues)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Static Site Generation Guide](https://vercel.com/guides/deploying-a-static-site)

---

**Last Updated:** March 29, 2026  
**Version:** 1.0.0
