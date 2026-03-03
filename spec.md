# VFX Video Editor

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Video upload: user can upload a video file from device (mobile-friendly, works on Samsung J7 and similar Android devices)
- Green screen (chroma key) removal: detect and remove green background from uploaded video frames in the browser using canvas processing
- Background replacement: after green screen removal, user can choose or upload a new background image/video to composite behind the subject
- VFX style filters: apply visual effects and style presets to the video (e.g. cinematic, glitch, color grading, vintage, neon, blur, brightness/contrast)
- Frame-by-frame preview: show a live canvas preview of the processed video with effects applied
- Export/download: allow user to download the processed video or capture a screenshot of the current frame
- Simple, mobile-first UI optimized for low-end Android devices (Samsung J7)

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: store project metadata, uploaded video references, user settings (VFX presets, background config)
2. Frontend:
   - Video upload input (accepts mp4, webm, etc.)
   - Canvas-based chroma key (green screen removal) using pixel manipulation
   - Background selector (upload custom background image or pick from presets)
   - VFX filter panel with style presets (cinematic, vintage, glitch, neon, etc.)
   - Live preview canvas showing composited output
   - Download/export button for processed frame or video
   - Mobile-first responsive layout
