# TABLES CMS - Tauri + Svelte Quick Start Guide

## Getting Started in 5 Minutes

### 1. Prerequisites Check

Make sure you have installed:
- **Node.js** 18+ (check: `node --version`)
- **Rust** 1.77.2+ (check: `rustc --version`)
- **npm** or **yarn** (check: `npm --version`)

If Rust is not installed:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. Install Dependencies

```bash
cd TABLES-TAURI
npm install
```

### 3. Run Development Mode

```bash
npm run tauri:dev
```

This will:
- Start the Vite dev server on port 5173
- Launch the Tauri desktop application
- Enable hot-reload for both frontend and backend

### 4. Build for Production

```bash
npm run tauri:build
```

Built apps will be in `src-tauri/target/release/bundle/`

## Project Structure Overview

```
TABLES-TAURI/
├── src/                    # Svelte frontend source
│   ├── components/         # UI components
│   │   ├── cms/           # CMS-specific components
│   │   │   └── sections/  # CMS section pages
│   │   ├── Layout.svelte  # Main layout
│   │   ├── Header.svelte  # Top header
│   │   └── SideMenu.svelte # Navigation menu
│   ├── stores/            # Svelte stores (state)
│   │   ├── cmsData.js    # Main CMS data store
│   │   └── loading.js    # Loading state
│   ├── utils/            # Helper functions
│   ├── styles/           # Global CSS
│   ├── App.svelte        # Root component
│   └── main.js           # Entry point
├── src-tauri/            # Rust backend
│   ├── src/
│   │   ├── lib.rs       # Backend commands
│   │   └── main.rs      # Entry point
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri config
├── static/              # Static assets (JSON data)
│   └── cms/            # CMS data files
├── index.html          # HTML template
├── package.json        # Node dependencies
├── vite.config.js     # Vite config
└── svelte.config.js   # Svelte config
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server only |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |
| `npm run tauri:dev` | Run Tauri app in development |
| `npm run tauri:build` | Build Tauri app for production |

## CMS Data Files

CMS data is stored in `static/cms/`:

- `pages.json` - Website pages
- `pageGroups.json` - Page groupings
- `blogArticles.json` - Blog posts
- `settings.json` - Site settings
- `extensions.json` - Extension configs
- `*Rows.json` - Database-like data (inventory, customers, etc.)

## Key Features

### 1. Settings Section
Configure site title, domain, Vercel deployment, branding, languages, and social media links.

### 2. Pages Management
Create, edit, and organize pages with component-based structure.

### 3. Blog
Write and manage blog articles with rich text editing.

### 4. Collaboration
Multi-user editing with real-time synchronization:
- Start a server (Host mode)
- Connect to existing server (Client mode)
- Field-level locking prevents conflicts

### 5. File Uploads
Upload and manage images, documents, and other assets.

### 6. Extensions
Enable/disable features like Notes sidebar.

## Troubleshooting

### Rust not found
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Restart terminal
```

### Port already in use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Build fails
```bash
# Clean and reinstall
rm -rf node_modules src-tauri/target
npm install
```

### Icons missing
Add placeholder icons to `src-tauri/icons/`:
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`

## Next Steps

1. **Customize Branding**: Update settings with your site info
2. **Add Content**: Create pages and blog posts
3. **Configure Deployment**: Set up Vercel integration
4. **Enable Extensions**: Turn on Notes or other features
5. **Build & Deploy**: Create production build

## Getting Help

- Check the main [README.md](./README.md) for detailed documentation
- Review component source code for implementation details
- Check Tauri docs: https://tauri.app/
- Check Svelte docs: https://svelte.dev/

## Migration from Electron/Gatsby

If you're migrating from the old TABLES Electron app:

1. Copy your CMS data from:
   `TABLES-OLD.app/Contents/Resources/cms-site/static/cms/*.json`
   to:
   `TABLES-TAURI/static/cms/`

2. Your data format is compatible - no conversion needed!

3. Uploads will be stored in the Tauri app data directory instead of the app bundle

Enjoy your new, faster TABLES CMS! 🚀
