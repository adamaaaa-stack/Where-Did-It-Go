# Icon Placeholder

Place your app icons here:

- **macOS**: `icon.icns` (1024x1024 pixels)
- **Windows**: `icon.ico` (256x256 pixels)
- **Linux**: `icon.png` (512x512 pixels)

For now, electron-builder will use default icons if these files are missing.

## Creating Icons

You can create icons from a single 1024x1024 PNG using online tools or:

### macOS (.icns)
```bash
# Using iconutil (macOS only)
mkdir icon.iconset
sips -z 16 16 icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32 icon.png --out icon.iconset/icon_16x16@2x.png
# ... (repeat for all sizes)
iconutil -c icns icon.iconset
```

### Windows (.ico)
Use online converters like cloudconvert.com or GIMP

### Linux (.png)
Just use a 512x512 PNG file
