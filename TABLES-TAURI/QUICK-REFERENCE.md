# TABLES CMS - Quick Reference Guide

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Run in browser (development)
npm run dev

# Run as Tauri desktop app
npm run tauri:dev

# Build for Vercel deployment
npm run build:ssg

# Deploy to Vercel
npm run deploy:vercel
```

## 📊 Data Format

### Pages (static/cms/pages.json)

**Old Format (compatible):**
```json
{
  "id": "123",
  "title": "Homepage",
  "slug": "home",
  "rows": [],
  "lastEdited": 1234567890
}
```

**New Format:**
```json
{
  "id": "123",
  "name": "Homepage",
  "slug": "home",
  "components": [],
  "createdAt": 1234567890,
  "updatedAt": 1234567890
}
```

✅ Both formats are automatically supported - the system transforms old format to new format on load.

### Blog Articles (static/cms/blogArticles.json)

```json
{
  "id": "123",
  "title": "Article Title",
  "slug": "article-title",
  "content": "<p>HTML content</p>",
  "excerpt": "Brief description",
  "author": "Author Name",
  "image": "/path/to/image.jpg",
  "status": "published",
  "tags": ["tag1", "tag2"],
  "category": "Category",
  "translations": {
    "es": {
      "title": "Título en Español",
      "content": "<p>Contenido en español</p>"
    }
  },
  "createdAt": 1234567890,
  "publishedAt": 1234567890
}
```

### Page Groups (static/cms/pageGroups.json)

```json
{
  "id": "123",
  "name": "Main Navigation",
  "slug": "main-nav",
  "pages": ["page-id-1", "page-id-2"],
  "showInMenu": true,
  "showInDropdown": true,
  "showSitemap": true,
  "order": 1
}
```

### Extensions (static/cms/extensions.json)

```json
{
  "pages-extension-enabled": true,
  "blog-extension-enabled": true,
  "page-groups-extension-enabled": true,
  "pedigree-extension-enabled": false,
  "rental-extension-enabled": false,
  "movie-tracker-enabled": true,
  "notes-extension-enabled": true
}
```

## 🎨 Theme Switching

### Programmatically
```javascript
// Set theme
document.body.className = 'theme-synthwave';
localStorage.setItem('tables-theme', 'synthwave');

// Available themes:
// - default, synthwave, matrix, monokai
// - github, vscode, anime, historic
// - senior, ayu
```

### In Settings
1. Go to Settings → Theme
2. Click on any theme card
3. Theme applies immediately

## 🔧 Extension Management

### Enable/Disable Extensions
1. Go to Extensions section
2. Toggle switches for each extension
3. Save changes

### Available Extensions

| Extension | ID | Production Ready |
|-----------|-----|-----------------|
| Pages | `pages-extension-enabled` | ✅ |
| Blog | `blog-extension-enabled` | ✅ |
| Page Groups | `page-groups-extension-enabled` | ✅ |
| Pedigree | `pedigree-extension-enabled` | ✅ |
| Rental | `rental-extension-enabled` | ✅ |
| Movie Tracker | `movie-tracker-enabled` | ✅ |
| Notes | `notes-extension-enabled` | ✅ |
| Personal | `personal-extension-enabled` | ⚠️ Demo |
| Biometric | `biometric-extension-enabled` | ⚠️ Demo |
| Medical | `medical-extension-enabled` | ⚠️ Demo |
| Financial | `financial-extension-enabled` | ⚠️ Demo |
| Legal | `legal-extension-enabled` | ⚠️ Demo |

## 📦 Component Types (Pages)

| Component | Description | Props |
|-----------|-------------|-------|
| Hero | Large header with CTA | title, subtitle, image, ctaText, ctaLink |
| Text | Rich text content | content |
| Image | Single image | src, alt, caption |
| Video | Embedded video | url, title |
| Features | Feature grid | title, items[] |
| CTA | Call to action | title, description, buttonText, link |
| Blog List | Recent articles | title, limit |
| Info Bar | Info bar | items[] |
| Ranking | Ranked list | title, items[] |
| Reviews | Testimonials | title, items[] |

## 🌐 Vercel Deployment

### Environment Variables
```
VERCEL_API_KEY=your_api_key_here
```

### Build Settings
- **Build Command:** `npm run build:ssg`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Deploy Commands
```bash
# One-click deploy
vercel --prod

# Or use npm script
npm run deploy:vercel
```

## 🐛 Troubleshooting

### JSON Load Errors
If you see "Failed to load JSON" warnings:
1. Check that JSON files are valid (use JSONLint)
2. Ensure files exist in `static/cms/`
3. Empty files should contain `[]` or `{}`

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Tauri Window Controls Not Working
This is normal in browser mode. Window controls only work in the desktop app.

### Extensions Not Showing
1. Go to Extensions section
2. Enable the required extension
3. Refresh the page

## 📝 Navigation Routes

```
/cms/settings       - Settings
/cms/extensions     - Extensions management
/cms/uploads        - File uploads
/cms/pages          - Pages editor
/cms/page-groups    - Page groups
/cms/blog           - Blog articles
/cms/pedigree       - Pedigree (if enabled)
/cms/personal       - Personal (if enabled)
/cms/inventory      - Rental inventory (if enabled)
/cms/attendance     - Rental attendance (if enabled)
/cms/customers      - Rental customers (if enabled)
/cms/employees      - Rental employees (if enabled)
/cms/reservations   - Rental reservations (if enabled)
/cms/calendar       - Rental calendar (if enabled)
/cms/movietracker   - Movie tracker (if enabled)
```

## 💾 Data Storage

### Browser Mode (Vercel)
- Data stored in `static/cms/*.json` files
- Changes saved to localStorage
- SSG generates static HTML

### Tauri Desktop
- Data stored in `static/cms/*.json` files
- Uploads stored in app data directory
- Full file system access

## 🔌 API Endpoints

### `/api/cms`
Returns all CMS data for the deployed site.

```javascript
GET /api/cms
// Returns: { pages, blogArticles, settings, extensions, ... }
```

### `/api/deploy`
Trigger deployment programmatically.

```javascript
POST /api/deploy
// Body: { apiKey: 'your-api-key' }
// Returns: { success: true, deploymentId: '...' }
```

## 📞 Support

- **Documentation:** README.md, DEPLOYMENT.md
- **Issues:** GitHub Issues
- **Implementation Details:** IMPLEMENTATION.md

---

**Last Updated:** March 24, 2026
