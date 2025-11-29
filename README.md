# VideoStudio - Browser-Based Video Editor

VideoStudio is a powerful, privacy-focused video editor that runs entirely in your web browser. Built with React and FFmpeg.wasm, it allows you to edit videos without uploading them to a server.

## Features

- **Trim Video**: Cut out unwanted parts of your video with a precise timeline editor.
- **Merge Videos**: Combine multiple video clips into a single seamless file.
- **Adjust Volume**: Boost or lower the audio volume of your video (up to 200%) with real-time preview.
- **Privacy First**: All processing happens locally on your device. Your videos never leave your computer.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

### Installation

1. Clone the repository or download the source code.
2. Navigate to the project directory:
   ```bash
   cd video-editor
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the development server:

```bash
npm run dev
```

Open your browser and visit `http://localhost:5173` (or the URL shown in your terminal).

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Docker Deployment

To run the application using Docker:

1. Build and start the container:
   ```bash
   docker-compose up -d --build
   ```

2. Access the application at `http://localhost:8080`.

The Docker setup includes a production-ready Nginx configuration with the required security headers (`Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy`) pre-configured.

## Technical Details

- **Framework**: React + Vite
- **Video Processing**: FFmpeg.wasm (WebAssembly port of FFmpeg)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Important Note on Headers

This project uses `SharedArrayBuffer` for FFmpeg.wasm, which requires specific security headers:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

These are already configured in `vite.config.ts` for the development server. If deploying to a static host (like Vercel, Netlify, or GitHub Pages), you must ensure these headers are set in the hosting configuration for the app to function correctly.
