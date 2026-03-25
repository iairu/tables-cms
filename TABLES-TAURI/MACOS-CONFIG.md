# ✅ macOS 12+ Configuration Complete

## Configuration Summary

TABLES CMS is now configured to build and run on **macOS 12.0 (Monterey)** and later.

## What Was Configured

### 1. tauri.conf.json
```json
{
  "bundle": {
    "macOS": {
      "minimumSystemVersion": "12.0"
    }
  }
}
```

### 2. Info.plist
```xml
<key>LSMinimumSystemVersion</key>
<string>12.0</string>
<key>NSHighResolutionCapable</key>
<true/>
<key>NSAppleEventsUsageDescription</key>
<string>TABLES CMS needs file system access to save and load your content.</string>
```

### 3. .cargo/config.toml
```toml
[target.aarch64-apple-darwin]
rustflags = ["-C", "link-arg=-mmacosx-version-min=12.0"]

[target.x86_64-apple-darwin]
rustflags = ["-C", "link-arg=-mmacosx-version-min=12.0"]
```

### 4. Window Settings
- Centered on launch
- Auto-focus enabled
- Proper minimum size (800x600)
- Resizable

## Build Commands

### Development
```bash
npm run tauri:dev
```

### Production Build
```bash
npm run build
npm run tauri:build
```

### Open Built App
```bash
open src-tauri/target/release/bundle/macos/TABLES\ CMS.app
```

## Supported Macs

✅ **Apple Silicon (M1/M2/M3)**
- MacBook Air (2022+)
- MacBook Pro (2021+)
- iMac (2021+)
- Mac mini (2023+)
- Mac Studio (2022+)
- MacBook Air 15" (2023+)

✅ **Intel Macs**
- MacBook (2015-2020)
- MacBook Air (2018-2020)
- MacBook Pro (2015-2020)
- iMac (2015-2020)
- iMac Pro (2017)
- Mac mini (2018-2020)
- Mac Pro (2019)

## Requirements

| Component | Version |
|-----------|---------|
| macOS | 12.0+ (Monterey) |
| Rust | 1.77.2+ |
| Node.js | 18+ |
| Xcode CLI | Latest |

## If App Won't Open

### Option 1: Remove Quarantine
```bash
xattr -cr src-tauri/target/release/bundle/macos/TABLES\ CMS.app
```

### Option 2: System Preferences
1. Open **System Preferences** → **Security & Privacy**
2. Click **Open Anyway** next to the blocked app message
3. Confirm you want to open

## File Locations After Build

```
TABLES-TAURI/
└── src-tauri/
    └── target/
        └── release/
            ├── TABLES CMS              ← Binary executable
            └── bundle/
                └── macos/
                    └── TABLES CMS.app  ← Application bundle
```

## Features

✅ Native macOS app  
✅ Retina display support  
✅ File system access  
✅ Window controls (minimize, maximize, close)  
✅ Centered window on launch  
✅ Proper app bundling  
✅ Code signing ready  
✅ Notarization ready  

## Testing Checklist

After building:

- [ ] App opens without errors
- [ ] Window appears centered
- [ ] Can minimize/maximize/close
- [ ] Can resize window
- [ ] CMS data loads
- [ ] Can navigate between sections
- [ ] Can create/edit pages
- [ ] Can toggle extensions
- [ ] File uploads work
- [ ] Settings save properly

## Next Steps

1. **Build the app:**
   ```bash
   npm run tauri:build
   ```

2. **Test on your Mac:**
   ```bash
   open src-tauri/target/release/bundle/macos/TABLES\ CMS.app
   ```

3. **If needed, remove quarantine:**
   ```bash
   xattr -cr src-tauri/target/release/bundle/macos/TABLES\ CMS.app
   ```

4. **Use the app!**

## Distribution Options

### Development (Current)
- Unsigned app
- Manual installation
- Requires `xattr` to bypass Gatekeeper

### App Store
- Requires Apple Developer account
- Must follow App Store guidelines
- Sandboxed environment

### Direct Distribution
- Code sign with Developer ID
- Notarize with Apple
- Distribute via DMG or ZIP

See `BUILD-MACOS.md` for detailed instructions.

## Troubleshooting

### Build Takes Too Long
First build compiles Rust dependencies. Subsequent builds are faster.

### App Size is Large
~15-20MB is normal for Tauri apps (includes WebKit runtime).

### Window Doesn't Center
This is a one-time issue. Close and reopen the app.

### Can't Open App
Run `xattr -cr` command or use System Preferences.

## Support

- **Documentation:** README.md, BUILD-MACOS.md
- **Fixes:** FIXES.md
- **Quick Reference:** QUICK-REFERENCE.md

---

**Status:** ✅ Ready to Build  
**Minimum macOS:** 12.0 (Monterey)  
**Last Updated:** March 24, 2026
