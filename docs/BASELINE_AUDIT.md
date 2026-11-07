# Phase 0 — 2026-11-07

Workspace was empty. Work is isolated in `chatstory-studio`; upstream checkouts remain outside it.
Node v24.19.0, npm 11.17.0, Git 2.55.0, gh 2.98.0. FFmpeg, FFprobe and Python unavailable on PATH. GitHub CLI credentials currently invalid; no publication attempted.

## Actual upstream inspection

* gaopengbin/wechat-dialog-generator commit `0e64ddb3b1a6843cc92218270bb539a0b2a6b352`: React 19, TypeScript, Vite 8 beta. PhonePreview renders text, images, voice-shaped bubbles, red packets and transfers. Voice seconds are parameters, not probed playable media. Capture modules export images/SVG. Account/payment/reward/analytics modules are present. No Remotion dependency or video encoder in package.json. README says MIT and links a nonexistent LICENSE; no actual license file found. Redistribution permission is unresolved. None of its code or assets is copied.
* AmirPhenomenal/fake-chat commit `0942acb352d66c1457e7a0add461166b9ab7eaf9`: React/Vite, mediabunny/WebCodecs and html-to-image. `src/video.js` builds frames at 30 FPS with fixed message gaps and browser codec fallback; `src/sounds.js` builds timeline audio. No license file found. Implementation inspected as a technical reference only; no code, icons, images, sounds or fonts copied.

## Decision

User explicitly prohibits copying without authorization. Implement an independent React UI with familiar chat conventions and original CSS, shared by Remotion Player and renderer. Keep upstream UI reuse blocked until complete authorization is available. Use generated initials, original SVG drawings and synthesized audio. Install packaged FFmpeg/FFprobe for reproducibility. This is a justified deviation from preferred upstream reuse, not a claim that README grants permission.

## Data flow / ownership

`src/schema` validates a single Story contract → `src/timeline` compiles frame intervals → `src/render` shares phone/chat components with editor Player → Node media preparation probes local audio and synthesizes optional TTS → Remotion renders MP4 → FFprobe validates → artifacts and logs stay on disk. Express binds loopback only. CLI and UI call the same pipeline.

Upstream install/build/test results and final dependency versions are recorded in the final report after execution.
