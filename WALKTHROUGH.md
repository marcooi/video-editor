# Project Walkthrough and Developer Guide

This document serves as a guide for future development on the VideoStudio project. It outlines the current architecture, key components, and implementation details.

## Project Overview

VideoStudio is a client-side video editor built with React and Vite. It uses `ffmpeg.wasm` for video processing, ensuring all data remains on the user's device.

## Core Technologies

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, `clsx`, `lucide-react` (icons)
- **Video Processing**: `@ffmpeg/ffmpeg`, `@ffmpeg/util`
- **Audio Preview**: Web Audio API (for accurate volume preview)

## Key Components

### 1. `App.tsx`
- **Role**: Main entry point and state manager.
- **Responsibilities**:
  - Loads FFmpeg core (`load` function).
  - Manages application mode (`trim`, `merge`, `volume`).
  - Handles global processing status and error messages.
  - Contains the core FFmpeg command logic for each feature (`handleTrim`, `handleMerge`, `handleVolumeChange`).

### 2. `TrimEditor.tsx`
- **Role**: Interface for video trimming.
- **Features**:
  - **Timeline**: Visual representation of video duration.
  - **Thumbnails**: Generates a strip of frame previews using a hidden video/canvas loop.
  - **Drag Handles**: Custom-styled range inputs for selecting start and end times.
  - **Preview**: `ThumbnailOverlay` shows the exact frame when dragging handles.

### 3. `VolumeEditor.tsx`
- **Role**: Interface for volume adjustment.
- **Implementation Details**:
  - Uses **Web Audio API** (`AudioContext`, `GainNode`) to provide an accurate real-time preview of volume changes, especially for amplification (>100%).
  - **Note**: The video element has `crossOrigin="anonymous"` to support Web Audio API processing.

### 4. `MergeEditor.tsx`
- **Role**: Interface for combining multiple video clips.
- **Logic**: Uses FFmpeg's concat demuxer to merge files.

## Critical Configuration

### FFmpeg Headers
To use `SharedArrayBuffer` (required by FFmpeg.wasm), the server must serve the app with specific headers.
- **Development**: Configured in `vite.config.ts`.
- **Production (Docker/Nginx)**: Configured in `nginx.conf`.
  ```nginx
  add_header Cross-Origin-Opener-Policy "same-origin";
  add_header Cross-Origin-Embedder-Policy "require-corp";
  ```

## Future Development Tips

- **Adding Filters**: To add video filters (brightness, contrast), create a new editor component (e.g., `FilterEditor.tsx`) and add a new mode in `App.tsx`. Use FFmpeg's `-vf` flag.
- **Performance**: Large files may take time to process. Consider implementing a web worker for UI responsiveness if moving heavy logic off the main thread (though FFmpeg.wasm already runs in a worker).

## How to Continue Development

To resume work on this project with an AI assistant, use the following prompt to ensure they have full context:

> "I am working on a browser-based video editor project. Please read the `WALKTHROUGH.md` file in the root directory to understand the project architecture, key components, and current state. Once you've read it, I'd like to [insert your next goal here]."
