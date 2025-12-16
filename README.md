# Where Did I Put That?

**A native desktop application** - local-first semantic file memory engine for macOS, Windows, and Linux.

Built with Electron (same technology as VS Code, Slack, Discord, Obsidian).

## What It Does

This **native desktop application** helps you find files using natural language, even when you don't remember their names or exact locations. It:

- Watches selected folders automatically
- Extracts text from PDFs, documents, and images (OCR)
- Generates semantic embeddings using GLM-4.6
- Allows natural language search
- Runs entirely on your computer (privacy-first)

## Installation & Building

### For Development (Testing)

1. **Install dependencies:**
```bash
npm install
```

2. **Run in development mode:**
```bash
npm run dev
```
This opens the app window for testing.

### Building the Actual Desktop App

To create a **standalone executable** that you can double-click to run:

**On macOS:**
```bash
npm run package:mac
```
Creates: `release/Where Did I Put That.dmg` and `.app` bundle

**On Windows:**
```bash
npm run package:win
```
Creates: `release/Where Did I Put That Setup.exe` (installer) and portable `.exe`

**On Linux:**
```bash
npm run package:linux
```
Creates: `release/Where Did I Put That.AppImage` and `.deb` package

**All platforms at once:**
```bash
npm run package:all
```

After building, find your app in the `release/` folder. You can:
- Double-click to run it
- Move it to Applications folder (macOS)
- Install it like any other program (Windows/Linux)
- Share it with others (they don't need npm/node)

### API Configuration

Your GLM API key is already configured in the `.env` file. When you build the app, the key will be bundled inside the executable.

## How to Use

### First Time Setup

1. Launch the application
2. Click "Settings" in the top right
3. Click "Add Folder" to select folders you want to monitor
4. The app will start indexing files automatically

### Searching for Files

1. Type natural language queries in the search bar:
   - "recipe for pasta"
   - "tax documents from 2024"
   - "meeting notes about project alpha"
   - "screenshot of error message"

2. Results appear instantly as you type

3. Click on a result to see:
   - File summary
   - Content preview
   - Match score
   - Last modified date

4. Actions available:
   - **Open File** - Opens the file in default application
   - **Reveal in Folder** - Shows file location in file explorer
   - **Copy Path** - Copies full file path to clipboard

## Supported File Types

- Text: `.txt`, `.md`
- PDFs: `.pdf`
- Documents: `.doc`, `.docx`
- Images (OCR): `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`

## Technical Architecture

### Backend (Electron Main Process)

- **File Watcher**: Monitors directories using chokidar
- **File Processor**: Extracts text from various formats
- **AI Service**: Generates embeddings and summaries via GLM-4.6
- **Database**: SQLite for local storage
- **Search Engine**: Cosine similarity + recency ranking

### Frontend (React)

- Clean, keyboard-first interface
- Real-time search with debouncing
- Split-pane layout for results and preview
- Settings panel for folder management

## File Structure

```
src/
├── main/                  # Backend (Node.js)
│   ├── index.ts          # Entry point
│   ├── database/         # SQLite schema and queries
│   ├── services/         # Core business logic
│   └── ipc/              # IPC handlers
├── preload/              # Electron preload script
└── renderer/             # Frontend (React + TypeScript)
    ├── App.tsx
    ├── components/
    └── styles/
```

## Privacy & Security

- All data stays on your computer
- No cloud storage or external servers
- Only API calls are to GLM-4.6 for embeddings
- Database stored in: `~/Library/Application Support/where-did-i-put-that/` (macOS)

## Troubleshooting

### "No results found"

- Make sure folders are added in Settings
- Wait for initial indexing to complete
- Check that files are in supported formats

### "Search is slow"

- Large files take longer to process
- Initial indexing of many files takes time
- Subsequent searches are fast

### "File not opening"

- Check file still exists at that location
- Verify you have permission to access the file
- Try "Reveal in Folder" to navigate manually

## Development

### Type Checking
```bash
npm run typecheck
```

### Building for Distribution
```bash
npm run build
```

## API Usage

The app uses GLM-4.6 for:
- **Embedding generation** (`embedding-3` model)
- **Text summarization** (`glm-4-flash` model)

API calls are made only when:
- New files are indexed
- Files are modified
- Search queries are executed

## Is This a "Real" Desktop App?

**Yes!** This is a native desktop application built with Electron.

### What you get after building:

- **macOS**: `.app` file you can drag to Applications folder
- **Windows**: `.exe` installer or portable executable
- **Linux**: `.AppImage` or `.deb` package you can install

### It's the same technology used by:
- Visual Studio Code
- Slack
- Discord
- Obsidian
- Figma Desktop
- WhatsApp Desktop
- Microsoft Teams

### Does NOT run in a web browser:
- ✅ Standalone application
- ✅ Appears in your dock/taskbar
- ✅ Works offline
- ✅ Full file system access
- ✅ Can be distributed as `.exe`/`.dmg`/`.AppImage`
- ❌ Does NOT require a browser to be open
- ❌ Does NOT need internet to run (only for AI embeddings)

When you run `npm run package:mac` (or win/linux), you get a **real executable** that anyone can run without installing Node.js or any development tools.

## License

Private use only.
