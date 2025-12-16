# Where Did I Put That?

A local-first semantic file memory engine for macOS, Windows, and Linux.

## What It Does

This desktop application helps you find files using natural language, even when you don't remember their names or exact locations. It:

- Watches selected folders automatically
- Extracts text from PDFs, documents, and images (OCR)
- Generates semantic embeddings using GLM-4.6
- Allows natural language search
- Runs entirely on your computer (privacy-first)

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

Your GLM API key is already configured in the `.env` file.

### 3. Run the Application

**Development mode:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
npm start
```

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

## License

Private use only.
