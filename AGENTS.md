# Project rules

Read docs/BASELINE_AUDIT.md and docs/ARCHITECTURE_REVIEW.md before changing modules. Keep src/schema as the single message contract; preview and render must continue to share src/render/Video.tsx. Keep Node filesystem/network code out of browser components. Use the media subprocess helper and pass argument arrays, never shell-interpolated script text. Do not copy upstream code/assets while their licensing remains unresolved.

For code changes run check, lint, focused tests and build. For timeline/audio/render changes create an actual MP4, probe/decode it and inspect representative frames. Never promote to stable based on unit tests only. Record skipped or failed checks honestly. Do not publish or upload private media or create a public GitHub repository without the user's final content/owner confirmation. No paid services, authentication bypass or destructive work outside this directory.
