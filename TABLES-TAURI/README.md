# TABLES CMS - Tauri + Svelte

A modern, performant Content Management System built with Tauri and Svelte. This is a rewrite of the original TABLES Electron + Gatsby + React CMS with improved performance and a smaller footprint.

## Features

- 🎨 **Modern UI** - Clean, responsive interface built with Svelte
- ⚡ **Fast Performance** - Tauri backend provides native performance
- 📦 **Small Footprint** - Much smaller bundle size compared to Electron
- 🔒 **Secure** - Rust backend with secure file handling
- 🔄 **Real-time Collaboration** - Multi-user editing with Socket.io
- 📝 **Rich Content** - WYSIWYG editors for content creation
- 🗂️ **Asset Management** - Built-in file upload and management
- 🌐 **Multi-language** - Support for multiple languages
- 🚀 **Deployment** - Vercel deployment integration

## Project Structure

```
TABLES-TAURI/
├── src/
│   ├── components/
│   │   ├── cms/
│   │   │   └── sections/
│   │   │       ├── SettingsSection.svelte
│   │   │       ├── PagesSection.svelte
│   │   │       ├── BlogSection.svelte
│   │   │       └── ... (other sections)
│   │   ├── Layout.svelte
│   │   ├── Header.svelte
│   │   ├── SideMenu.svelte
│   │   └── ...
│   ├── stores/
│   │   ├── cmsData.js
│   │   └── loading.js
│   ├── utils/
│   │   └── navigation.js
│   ├── styles/
│   │   └── global.css
│   ├── App.svelte
│   └── main.js
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs
│   │   └── main.rs
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── ...
├── index.html
├── package.json
├── vite.config.js
└── svelte.config.js
```

## Prerequisites

- Node.js 18+ 
- Rust 1.77.2+
- npm or yarn

## Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run tauri:dev
```

This will start both the Vite dev server and the Tauri application.

## Building

### Development Build
```bash
npm run tauri:dev
```

### Production Build
```bash
npm run tauri:build
```

### Platform-specific Builds
```bash
# macOS
npm run tauri:build -- --target x86_64-apple-darwin
npm run tauri:build -- --target aarch64-apple-darwin

# Windows
npm run tauri:build -- --target x86_64-pc-windows-msvc
```

## CMS Sections

- **Pages** - Manage website pages with component-based structure
- **Page Groups** - Organize pages into hierarchical groups
- **Blog** - Create and manage blog articles
- **Pedigree** - Track cat pedigrees and breeding records
- **Personal** - Personal notes and data
- **Rental Management**
  - Inventory - Track rental items
  - Attendance - Record attendance
  - Customers - Customer database
  - Employees - Employee management
  - Reservations - Booking system
  - Calendar - Visual calendar view
- **Settings** - Site configuration and branding
- **Extensions** - Enable/disable features
- **Uploads** - File and asset management
- **Movie Tracker** - Personal movie tracking

## Collaboration

The CMS supports real-time collaboration:

1. **Host Mode** - Start a server to host a collaborative session
2. **Client Mode** - Connect to a host for synchronized editing
3. **Field Locking** - Prevent edit conflicts with automatic locking
4. **Auto-discovery** - Find servers on the local network

## Data Storage

- CMS data is stored in `static/cms/*.json` files
- User uploads are stored in the Tauri app data directory
- Settings are persisted in localStorage
- Collaboration state is managed via Socket.io

## Migration from Electron/Gatsby

This Tauri + Svelte version replaces the original Electron + Gatsby + React CMS:

| Feature | Old (Electron) | New (Tauri) |
|---------|---------------|-------------|
| Bundle Size | ~150MB | ~15MB |
| Memory Usage | ~500MB | ~100MB |
| Startup Time | ~5s | ~1s |
| Framework | React | Svelte |
| Backend | Node.js | Rust |

## API Commands

The Tauri backend provides these commands:

- `save_attachment` - Save file attachments
- `get_attachment` - Retrieve attachments
- `delete_attachment` - Remove attachments
- `upload_file` - Upload new files
- `get_uploads` - List all uploads
- `delete_upload` - Delete uploaded files

## License

MIT

## Credits

Built with:
- [Tauri](https://tauri.app/) - Native app framework
- [Svelte](https://svelte.dev/) - Reactive UI framework
- [Socket.io](https://socket.io/) - Real-time communication
- [FontAwesome](https://fontawesome.com/) - Icons
