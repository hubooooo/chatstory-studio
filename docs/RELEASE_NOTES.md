# v0.1.0 — prerelease candidate

Local phone chat video creation: Chinese editor, shared Remotion timeline/preview/export, original device/chat UI, Story Schema v1, real Edge male/female speech, Windows/local-audio fallback, original synthesized effects, MP4 artifacts and isolated batch processing.

Install Node.js 22/24 LTS, run `npm ci` then `npm run dev`, or use `start-windows.cmd`. Open http://127.0.0.1:3210. No Electron installer is supplied. First render downloads a browser; cached speech and local recordings work offline. See README for optional Edge CLI and Windows speech prerequisites.

Validated on Windows: unit/schema/media checks, actual editor export, 3 real 1080×1920 30FPS H.264/AAC videos, full decoding, representative frames, deterministic repeated frames, audio onset timing, preview/export parity, cold source-copy installation and measured 30/60s rendering. Exact counts/evidence are in FINAL_REPORT and adjacent JSON; remote CI is not claimed until executed on the authorized repository.

Known limitations: simplified simulated money/contact bubbles; recall notice does not delete a targeted historical message; split exceptionally tall bubbles; interrupted jobs restart from the beginning. No stable v1 guarantee or fresh-OS certification. Human subjective listening and public GitHub acceptance remain user checkpoints.

Original source is MIT, but Remotion's custom organization licensing requirements and other dependency/platform/service terms apply. Upstream code/assets were not copied because actual license files were absent. Full provenance/notices are included. Generated chats are fictional and must not be presented as real evidence.

This file prepares release notes; it does not indicate that a GitHub Release already exists.
