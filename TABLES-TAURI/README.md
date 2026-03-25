# TABLES CMS - Tauri + Svelte

A modern, performant Content Management System built with Tauri and Svelte. This is a complete rewrite of the original Electron + Gatsby + React CMS with improved performance, smaller footprint, and seamless Vercel deployment.

![TABLES CMS](../TABLES.app/Contents/Resources/static/assets/tables-feature-highlight-banner.png)

## Features

### Core Features
- 🎨 **Modern UI** - Clean, responsive interface built with Svelte
- ⚡ **Fast Performance** - Tauri backend provides native performance
- 📦 **Small Footprint** - Much smaller bundle size compared to Electron
- 🔒 **Secure** - Rust backend with secure file handling
- 🔄 **Real-time Collaboration** - Multi-user editing with Socket.io (coming soon)
- 📝 **Rich Content** - WYSIWYG editors for content creation
- 🗂️ **Asset Management** - Built-in file upload and management
- 🌐 **Multi-language** - Support for multiple languages
- 🚀 **Vercel Deployment** - One-click deployment to Vercel
- 🎨 **Theme System** - 10 built-in themes with easy switching

### Extensions
- **Pages** - Component-based page builder
- **Blog** - Full-featured blogging engine with multilingual support
- **Page Groups** - Organize pages with dropdown menus
- **Pedigree** - Track cat pedigrees and breeding records
- **Rental Management** - Complete rental business solution
- **Movie Tracker** - Personal movie tracking with IMDB integration
- **Personal Database** - Personal information storage
- **Biometric Database** - Demo biometric data (⚠️ demo only)
- **Medical Records** - Health records management (⚠️ demo only)
- **Financial Database** - Financial tracking (⚠️ demo only)
- **Legal Records** - Legal information (⚠️ demo only)

## Prerequisites

- **Node.js** 18+ 
- **Rust** 1.77.2+ (for Tauri desktop app)
- **npm** or **yarn**

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/iairu/tables-cms.git
cd tables-cms/TABLES-TAURI

# Install dependencies
npm install
```

### Development

```bash
# Run in browser mode (Vite dev server)
npm run dev

# Run as Tauri desktop app
npm run tauri:dev
```

### Building

```bash
# Build for web (Vercel deployment)
npm run build:ssg

# Build Tauri desktop app
npm run tauri:build
```

## Project Structure

```
TABLES-TAURI/
├── src/
│   ├── components/
│   │   ├── cms/
│   │   │   └── sections/
│   │   │       ├── SettingsSection.svelte
│   │   │       ├── PagesSection.svelte
│   │   │       ├── PageGroupsSection.svelte
│   │   │       ├── BlogSection.svelte
│   │   │       ├── ExtensionsSection.svelte
│   │   │       └── ... (other sections)
│   │   ├── Layout.svelte
│   │   ├── Header.svelte
│   │   ├── SideMenu.svelte
│   │   ├── LoadingBar.svelte
│   │   └── LoadingSkeleton.svelte
│   ├── stores/
│   │   ├── cmsData.js
│   │   └── loading.js
│   ├── styles/
│   │   └── global.css
│   ├── utils/
│   │   └── navigation.js
│   ├── App.svelte
│   └── main.js
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs
│   │   └── main.rs
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── ...
├── scripts/
│   └── ssg-build.js
├── api/
│   ├── cms.js
│   └── deploy.js
├── static/
│   ├── assets/
│   └── cms/
├── dist/
├── package.json
├── vercel.json
├── vite.config.js
└── svelte.config.js
```

## Vercel Deployment

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/iairu/tables-cms)

### Manual Deployment

1. **Build the static site:**
   ```bash
   npm run build:ssg
   ```

2. **Deploy to Vercel:**
   ```bash
   npm run deploy:vercel
   ```

   Or using Vercel CLI:
   ```bash
   vercel --prod
   ```

### Configuration

The `vercel.json` file contains the deployment configuration:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build:ssg",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": { "cache-control": "public, max-age=31536000, immutable" }
    },
    {
      "src": "/cms/(.*)",
      "headers": { "cache-control": "public, max-age=60, must-revalidate" }
    }
  ]
}
```

### Environment Variables

Set these in your Vercel project settings:

- `VERCEL_API_KEY` - Your Vercel API key for programmatic deployments

## Usage Guide

### Extensions System

1. Go to **Extensions** in the sidebar
2. Toggle extensions on/off
3. Some extensions show warnings (demo only, not for production use)

**Available Extensions:**

| Extension | Category | Production Ready |
|-----------|----------|------------------|
| Pages | Core | ✅ Yes |
| Blog | Core | ✅ Yes |
| Page Groups | Core | ✅ Yes |
| Pedigree | Database | ✅ Yes |
| Rental Management | Business | ✅ Yes |
| Movie Tracker | Personal | ✅ Yes |
| Notes | Productivity | ✅ Yes |
| Personal | Personal | ⚠️ Demo Only |
| Biometric | Sensitive | ⚠️ Demo Only |
| Medical | Sensitive | ⚠️ Demo Only |
| Financial | Sensitive | ⚠️ Demo Only |
| Legal | Sensitive | ⚠️ Demo Only |

### Pages Extension

1. Navigate to **Pages**
2. Click **New Page** to create a page
3. Edit page details (name, slug)
4. Add components from the dropdown:
   - **Hero Section** - Large header with CTA
   - **Text Block** - Rich text content
   - **Image** - Single image with caption
   - **Video** - Embedded video
   - **Features Grid** - Feature cards
   - **Call to Action** - CTA section
   - **Blog List** - Recent articles
   - And more...
5. Arrange components using drag & drop
6. Save and build

### Blog Extension

1. Navigate to **Blog**
2. Click **New Article**
3. Fill in article details:
   - Title, slug, excerpt
   - Featured image
   - Author, category, tags
4. Use the rich text editor for content
5. Add translations for multilingual support
6. Publish when ready

### Page Groups Extension

1. Navigate to **Page Groups**
2. Create a new group
3. Configure display settings:
   - Show in Main Menu
   - Show Dropdown Menu
   - Show in Sitemap
4. Add pages to the group
5. Arrange page order
6. Preview dropdown menu

### Theme System

1. Go to **Settings** → **Theme**
2. Choose from 10 built-in themes:
   - **Default** - Clean modern blue
   - **Synthwave** - Retro futuristic
   - **Matrix** - Classic green on black
   - **Monokai** - Popular dark code theme
   - **GitHub** - Familiar GitHub style
   - **VS Code** - Dark editor theme
   - **Anime** - Vibrant pink kawaii
   - **Historic Paper** - Vintage parchment
   - **Senior Citizen** - High contrast
   - **Ayu** - Warm dark theme
3. Theme changes apply immediately

## API Routes

### `/api/cms`

Fetch CMS data for the deployed site.

```javascript
GET /api/cms
// Returns: { pages, blogArticles, settings, ... }
```

### `/api/deploy`

Trigger a new deployment.

```javascript
POST /api/deploy
// Body: { apiKey: 'your-api-key' }
// Returns: { success: true, deploymentId: '...' }
```

## SSG Build Script

The `scripts/ssg-build.js` generates static HTML files:

```bash
npm run build:ssg
```

This creates:
- `dist/index.html` - Home page
- `dist/pages/*.html` - Individual pages
- `dist/blog/*.html` - Blog articles
- `dist/assets/css/main.css` - Generated styles
- `dist/assets/js/main.js` - Runtime JavaScript
- `dist/cms/*.json` - CMS data files

## Collaboration Features (Coming Soon)

Real-time collaboration allows multiple users to edit content simultaneously:

1. Enable **Collaboration** in Settings
2. Start or connect to a collaboration server
3. See who else is editing
4. Field-level locking prevents conflicts

**GDPR Notice:** When collaboration is enabled, your IP, location, and collaboration token are stored on the server.

## Comparison: Old vs New

| Feature | Electron + React | Tauri + Svelte |
|---------|-----------------|----------------|
| Bundle Size | ~150MB | ~15MB |
| Memory Usage | ~500MB | ~100MB |
| Startup Time | ~5s | ~1s |
| Framework | React | Svelte |
| Backend | Node.js | Rust |
| Deployment | Complex | Vercel-ready |

## Troubleshooting

### Build Issues

```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build:ssg
```

### Tauri Issues

```bash
# Check Rust installation
rustc --version

# Update Tauri CLI
npm install -g @tauri-apps/cli
```

### Vercel Deployment Issues

```bash
# Check vercel.json syntax
cat vercel.json | jq .

# View deployment logs
vercel logs
```

## Development

### Adding New Extensions

1. Create extension component in `src/components/cms/sections/`
2. Add to `ExtensionsSection.svelte`
3. Update `App.svelte` routing
4. Add menu item to `SideMenu.svelte`

### Adding New Themes

1. Add theme variables to `src/styles/global.css`
2. Add theme to `SettingsSection.svelte` themes array
3. Test theme switching

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License - see [LICENSE](../LICENSE) for details.

## Credits

Built with:
- [Tauri](https://tauri.app/) - Native app framework
- [Svelte](https://svelte.dev/) - Reactive UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Socket.io](https://socket.io/) - Real-time communication
- [FontAwesome](https://fontawesome.com/) - Icons
- [Vercel](https://vercel.com/) - Deployment platform

## Support

- **Documentation:** This README
- **Issues:** [GitHub Issues](https://github.com/iairu/tables-cms/issues)
- **Discussions:** [GitHub Discussions](https://github.com/iairu/tables-cms/discussions)

---

Made with ❤️ by the TABLES Team
