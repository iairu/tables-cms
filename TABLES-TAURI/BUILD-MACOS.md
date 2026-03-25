# TABLES CMS - macOS Build Guide

## System Requirements

- **macOS 12.0+** (Monterey or later)
- **Xcode Command Line Tools**
- **Rust 1.77.2+**
- **Node.js 18+**

## Quick Start

### 1. Install Dependencies

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Node.js (if not already installed)
# Download from https://nodejs.org or use Homebrew:
brew install node@18

# Navigate to project
cd TABLES-TAURI

# Install npm dependencies
npm install
```

### 2. Development Mode

```bash
# Run in development mode (opens Tauri app)
npm run tauri:dev
```

### 3. Build Production App

```bash
# Build the frontend first
npm run build

# Build the macOS app
npm run tauri:build
```

The built app will be located at:
```
src-tauri/target/release/bundle/macos/TABLES CMS.app
```

### 4. Run the Built App

```bash
# Open the built application
open src-tauri/target/release/bundle/macos/TABLES\ CMS.app
```

## Build Configuration

### macOS Target

The app is configured to build for:
- **Minimum macOS Version:** 12.0 (Monterey)
- **Architectures:** 
  - `aarch64-apple-darwin` (Apple Silicon M1/M2/M3)
  - `x86_64-apple-darwin` (Intel Macs)

### Universal Binary (Optional)

To build a universal binary that works on both Apple Silicon and Intel Macs:

```bash
# Build for both architectures
npm run tauri:build -- --target universal-apple-darwin
```

Or build separately:

```bash
# Apple Silicon
npm run tauri:build -- --target aarch64-apple-darwin

# Intel Macs
npm run tauri:build -- --target x86_64-apple-darwin
```

## Troubleshooting

### App Won't Open - "App is damaged"

This is a macOS security feature. To bypass:

```bash
# Remove quarantine attribute
xattr -cr src-tauri/target/release/bundle/macos/TABLES\ CMS.app

# Or use System Preferences:
# 1. Go to System Preferences → Security & Privacy
# 2. Click "Open Anyway" next to the blocked app message
```

### Build Fails - Rust Version

If you get Rust version errors:

```bash
# Update Rust
rustup update

# Check version
rustc --version  # Should be 1.77.2 or higher
```

### Build Fails - Missing Dependencies

```bash
# Reinstall npm dependencies
rm -rf node_modules
npm install

# Reinstall Rust dependencies
cd src-tauri
cargo clean
cargo build
```

### App Crashes on Launch

Check the logs:

```bash
# View console logs
log show --predicate 'process == "TABLES CMS"' --last 5m

# Or use Console.app to view application logs
```

## Code Signing (Optional)

For distribution outside of development:

```bash
# Get your Developer ID Application certificate from Apple

# Sign the app
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Your Name (XXXXXXXX)" \
  src-tauri/target/release/bundle/macos/TABLES\ CMS.app

# Notarize (required for distribution)
xcrun notarytool submit \
  --apple-id "your@email.com" \
  --team-id "YOUR_TEAM_ID" \
  --password "your-app-specific-password" \
  src-tauri/target/release/bundle/macos/TABLES\ CMS.app
```

## Configuration Files

### tauri.conf.json

Key macOS settings:
```json
{
  "bundle": {
    "macOS": {
      "minimumSystemVersion": "12.0"
    }
  }
}
```

### Info.plist

Located at `src-tauri/Info.plist`, contains:
- `LSMinimumSystemVersion`: 12.0
- `NSHighResolutionCapable`: true (Retina display support)
- `NSAppleEventsUsageDescription`: File system access description

## App Location After Build

```
TABLES-TAURI/
└── src-tauri/
    └── target/
        └── release/
            └── bundle/
                └── macos/
                    ├── TABLES CMS.app          ← Main application
                    └── TABLES CMS.dmg          ← Disk image (if enabled)
```

## Testing on Different macOS Versions

### Minimum Version Testing

Test on macOS 12.0+ to ensure compatibility:

1. Build the app
2. Copy to Mac running macOS 12.0
3. Remove quarantine: `xattr -cr TABLES\ CMS.app`
4. Open and test all features

### Architecture Testing

- **Apple Silicon:** M1, M2, M3 Macs
- **Intel:** 2015-2020 Intel Macs

## Performance Optimization

The build is already optimized with:
- LTO (Link Time Optimization)
- Size optimization (`opt-level = "s"`)
- Stripped symbols
- Panic abort

See `src-tauri/Cargo.toml` `[profile.release]` section.

## Quick Commands Reference

| Command | Description |
|---------|-------------|
| `npm run tauri:dev` | Run in development mode |
| `npm run tauri:build` | Build production app |
| `npm run build` | Build frontend only |
| `npm run dev` | Run frontend dev server |
| `cargo clean` | Clean Rust build cache |

## Support

For issues:
1. Check [FIXES.md](FIXES.md) for known issues
2. View logs with `log show` or Console.app
3. Check Rust and Node.js versions
4. Clean and rebuild

---

**Minimum macOS Version:** 12.0 (Monterey)  
**Last Updated:** March 24, 2026
