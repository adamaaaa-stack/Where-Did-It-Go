# Built Desktop Applications

## ✅ Successfully Built Executables

All applications are in the `/home/user/Where-Did-It-Go/release/` directory.

### Linux

1. **AppImage (Portable)**
   - File: `Where Did I Put That-1.0.0.AppImage`
   - Size: 128 MB
   - How to run:
     ```bash
     chmod +x "Where Did I Put That-1.0.0.AppImage"
     ./Where\ Did\ I\ Put\ That-1.0.0.AppImage
     ```

2. **Debian Package**
   - File: `where-did-i-put-that_1.0.0_amd64.deb`
   - Size: 80 MB
   - How to install:
     ```bash
     sudo dpkg -i where-did-i-put-that_1.0.0_amd64.deb
     ```

### Windows

1. **Portable Zip Archive**
   - File: `Where-Did-I-Put-That-1.0.0-win.zip`
   - Size: ~130 MB
   - How to use:
     1. Extract the zip file
     2. Navigate to `win-unpacked/`
     3. Double-click `Where Did I Put That.exe`

### macOS

❌ **Not Built** - Building macOS applications from Linux requires macOS-specific dependencies that cannot be installed on Linux (dmg-license).

**To build on macOS:**
```bash
# On a Mac computer
npm install
npm run package:mac
```

This will create `.dmg` and `.zip` files in the `release/` folder.

## Application Features

- ✅ Native desktop application (not a web app)
- ✅ Semantic file search using GLM-4.6 AI
- ✅ Automatic file indexing
- ✅ Supports PDFs, DOCX, TXT, MD, and images (OCR)
- ✅ Natural language queries
- ✅ Privacy-first (all data stored locally)
- ✅ Cross-platform (Windows, macOS, Linux)

## Your API Key

Your GLM-4.6 API key is already configured in `.env`:
```
5ccb8326d8ff4957b811c653f98e5a8a.cZ1QQIPTIIMlvKBb
```

This key is bundled into the executables during the build process.

## Next Steps

1. Choose your platform executable from above
2. Extract/install according to instructions
3. Launch the application
4. Go to Settings → Add Folder
5. Select folders to index
6. Start searching with natural language!
