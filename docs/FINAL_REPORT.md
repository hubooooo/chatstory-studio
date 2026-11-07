# ChatStory Studio delivery — 2026-11-07

Usable local end-to-end prerelease candidate, not a claim of stable v1.0.0 or completed public publication. Project is isolated in chatstory-studio; original work and two reference checkouts remain untouched outside it.

## Executed commands

- git clone both requested repositories; inspected actual trees, license absence, entrypoints and media paths.
- Upstream main: npm ci --ignore-scripts, npm run build, npm test: build PASS, 123 passed / 0 failed / 0 skipped. Initial restricted-user filesystem/account failures were rerun in the normal authorized Windows environment.
- New project: npm install, safe dependency upgrades, npm audit fix; final npm audit reports 0 vulnerabilities.
- npm run check, npm run lint, npm run build.
- npm test and JSON reporter: 15 passed, 0 failed, 0 skipped in 2 test files. A temporary cold-copy duplication was removed by explicit test includes; counts are not inflated.
- npm run dev; npm run test:ui; npx tsx tests/export.ts; npx tsx tests/visual.ts.
- npm run tts -- --input examples/demo-b.json; npx tsx scripts/edge-demo.ts. Final independent Python Edge adapter succeeded for both sexes. Earlier npm-library attempt timed out and was removed for licensing reasons. Offline Windows synthesis also succeeded.
- npm run render -- --input examples/demo-a.json --output outputs/demo-a.mp4.
- npm run batch -- --input-dir examples --output-dir outputs; all 3 passed.
- npx tsx scripts/qa.ts; later --frames-only refresh; npx tsx tests/media-integration.ts; npx tsx tests/ci-render.ts.
- npx tsx tests/performance.ts; pwsh -NoProfile -File scripts/measure-memory.ps1.
- npx tsx scripts/cold-start.ts; independent source npm ci, build, service and Chinese/space-path MP4 PASS.
- npx tsx scripts/notices.ts; npx tsx scripts/security.ts; gh auth status (masked, no raw token printed); proposed repo lookup only, no creation/push/publication.

## Media

| Video | Resolution | Frame rate | Codecs | Duration | Render |
|---|---|---|---|---|---|
| demo-a | 1080×1920 | 30/1 | h264 / aac | 9.152000s | 20139ms |
| demo-b | 1080×1920 | 30/1 | h264 / aac | 12.950000s | 24809ms |
| demo-c | 1080×1920 | 30/1 | h264 / aac | 10.752000s | 25075ms |

Each output includes source JSON, prepared Story, log, validation JSON, JPG and SRT. Source/assets/examples are committed; generated videos, private projects, uploaded media and runtime caches are not committed. Full decode, representative-frame review, timing, repeat-frame hashes, editor export and parity checks are described in RENDER_QA_REPORT.md with machine-readable evidence.

## Acceptance mapping

1–4: local service, nonblocking React UI, status controls and complete 1080×1920 phone — PASS in UI, cold and visual tests.
5–7: varied messages, smooth scrolling and synchronized original effects — PASS, 10 effect onset checks within one frame.
8–9: real Edge male/female audio, probe-based seconds — synthesis/probe/decode PASS; subjective speaker listening not performed by agent.
10–14: long mixed text, three independent examples, correct parameters, both tracks and complete decode — PASS on supplied examples.
15–16: isolated batch failure and identical repeat decoded video frames — PASS.
17–18: fixed chrome not cropped; editor/export same-frame SSIM 0.988771 — PASS.

## Implemented scope and limits

Original device/chat UI, editor CRUD/reorder, roles/avatars, appearance templates, frame timing, typing/pop/scroll, playable/animated voice bars, Edge/offline/local audio/cache, original effects/volume/mute/limiter, schema, save/import/export, serial persisted queue/retry, CLI/batch, artifacts, probe/decode QA, docs and CI configuration are implemented.

Do not claim stable completeness: finance/contact visuals are simplified; recall is currently a notice rather than targeted history deletion; extremely tall single bubbles should be split; queue restarts from beginning rather than resuming a partial encode. Voice settings cache invalidation is automatic through UI; externally edited JSON with a fixed audio_path intentionally retains that recording. No Electron installer or AI story-writing model is included. No public remote CI result exists before authorized publication.

## Licensing / security / operation

No upstream code/assets copied because actual license files were absent. Own code is MIT; Remotion custom eligibility/company-license requirements, media-binary GPL/LGPL terms and speech-service/platform conditions remain independent. Full notices and inventory are preserved. Core functionality never calls upstream login, recharge or credit services; no paid calls or credentials were used.

Host/Origin checks, loopback binding, safe subprocess arguments, realpath asset confinement and color/path validation are implemented. Local secret/history pattern scan and dependency audit passed; public CI adds gitleaks. No claim of exhaustive security proof is made.

Start: npm ci → npm run dev → http://127.0.0.1:3210 (or start-windows.cmd). Use README's render/batch commands. Edge CLI is optional when cached/local audio is used. FFmpeg/FFprobe installed by npm; first render downloads a browser unless CHROME_PATH is supplied. All evidence and MP4 files remain on disk.

Last committed source checkpoint when this report was generated: 580ecf8a1f10c20d2deda0b87df2f915005dcc47. Final immutable source commit is recorded in outputs/release/release-manifest.json after the final local commit. Git history contains stage checkpoints; this continuous implementation did not manufacture backdated per-phase histories.
