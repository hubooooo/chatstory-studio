import fs from "node:fs/promises";
import { run, ROOT } from "./media";
const read = async (p: string) =>
  JSON.parse((await fs.readFile(p, "utf8")).replace(/^\uFEFF/, ""));
const batch = await read("outputs/batch-results.json"),
  perf = await read("docs/performance-results.json"),
  editor = await read("docs/editor-performance.json"),
  cold = await read("docs/cold-start-results.json"),
  memory = await read("docs/memory-results.json"),
  parity = await read("docs/preview-parity.json"),
  sync = await read("docs/media-integration.json");
const raw = await read("outputs/qa/unit-final.json");
const unit = {
  success: raw.success,
  passed: raw.numPassedTests,
  failed: raw.numFailedTests,
  skipped: raw.numPendingTests,
  total: raw.numTotalTests,
  files: raw.testResults.map(
    (x: { name: string; status: string; assertionResults: unknown[] }) => ({
      name: x.name.split(/[\\/]/).pop(),
      status: x.status,
      tests: x.assertionResults.length,
    }),
  ),
};
await fs.writeFile("docs/unit-tests.json", JSON.stringify(unit, null, 2));
const sourceCommit = (
  await run("git", [
    "-c",
    `safe.directory=${ROOT.replaceAll("\\", "/")}`,
    "rev-parse",
    "HEAD",
  ])
).trim();
const media = [];
for (const n of ["demo-a", "demo-b", "demo-c"]) {
  const r = await read(`outputs/${n}.validation.json`),
    v = r.media.streams.find(
      (x: { codec_type: string }) => x.codec_type === "video",
    ),
    a = r.media.streams.find(
      (x: { codec_type: string }) => x.codec_type === "audio",
    );
  media.push(
    `| ${n} | ${v.width}×${v.height} | ${v.r_frame_rate} | ${v.codec_name} / ${a.codec_name} | ${r.media.format.duration}s | ${r.elapsed_ms}ms |`,
  );
}
await fs.writeFile(
  "docs/ARCHITECTURE_REVIEW.md",
  `# Architecture review — 2026-11-07

Single Story model: src/schema/story.ts, runtime Zod validation plus generated JSON Schema. src/timeline compiles stable frame events and deterministic scroll offsets. src/render/Video.tsx owns the shared scene used by Player and renderer. Phone and Conversation contain no filesystem or server dependencies. No upstream code or account/payment/analytics modules were copied.

Node boundaries: scripts/media.ts centralizes safe subprocess execution, probing, resource confinement and voice preparation. src/audio/effects.ts generates original tone assets. src/tts contains independent Edge CLI and Windows adapters. scripts/pipeline.ts owns bundling, MP4 encoding, limiting, artifact generation and probing; both CLI and server call it. scripts/server.ts binds loopback, persists jobs under data/, serializes rendering, stores projects and handles uploads. Editor uses these same APIs.

Audit fixes: bounded audio Sequence lifetimes prevent Player tag exhaustion; controls moved outside the phone; scoped box sizing shared between preview/export; bundles refreshed for new uploads; raw source saved separately from prepared Story; preparation failures now write logs; retry restores original job; uploaded/generated media are ignored except explicitly reviewed sample assets; changing UI voice/rate clears synthesized caches; no shell interpolation for media or speech.

No incompatible message definitions or duplicate render UIs found. Generic process helper is shared. Compact single-package layout retained instead of speculative monorepo. To add a theme, extend Phone/Conversation using Story; to add a voice engine, extend preparation and its backend enum, retaining real-duration probing. Some developer validation scripts intentionally live in scripts/ and tests/ rather than product packages.

Limits: simplified finance/card visuals; recall notice does not target a prior bubble; estimated row layout needs a future measured layout for exceptionally tall single messages; queue retries from the start, not mid-frame. Public network deployment is outside the supported local-only model.
`,
);
await fs.writeFile(
  "docs/PERFORMANCE_REPORT.md",
  `# Performance — measured 2026-11-07

Windows ${editor.platform}, ${editor.cpu}, ${(editor.total_ram_bytes / 1024 ** 3).toFixed(1)} GiB RAM, Node ${editor.node}. Remotion concurrency 2, 1080×1920, 30 FPS, local H.264/AAC encoding. These are one-machine measurements, not universal promises.

| Metric | Actual result |
|---|---|
| Isolated source npm ci, shared download cache | ${cold.install_ms} ms |
| Local service ready | ${cold.server_ready_ms} ms |
| Import 100 messages through UI | ${editor.import_100_messages_ms} ms |
| Edit with 100 messages loaded | ${editor.edit_100_messages_ms} ms |
| Observed preview frame changes during 2s | ${editor.preview_observed_fps.toFixed(2)} FPS |
| 30-second video | ${perf.benchmarks[0].render_ms} ms |
| 60-second video | ${perf.benchmarks[1].render_ms} ms |
| Peak sampled renderer process-tree working set, 30s | ${(memory.peak_process_tree_working_set_bytes / 1024 ** 3).toFixed(2)} GiB, ${memory.samples} samples |
| Measured memory-run wall time incl. sampling | ${memory.render_wall_ms} ms |
| Three-project serial batch | ${batch.reduce((a: number, x: { elapsed_ms: number }) => a + x.elapsed_ms, 0)} ms |

Import/edit are end-to-end automation timings. Preview sampling counts distinct committed frame values, not monitor refresh rate. Browser rendering and automation overhead are included. Memory includes Node renderer and descendants, excludes separate editor service, samples approximately every 500ms plus CIM overhead and may miss very brief peaks. Parent-only post-render RSS in performance-results.json is not misrepresented as a process-tree peak.

Cold test ran in a fresh source copy under a Chinese/space path on this same Windows machine, using a shared npm cache; not a pristine OS. First-ever internet dependency/browser download time is network dependent and not separately benchmarked. No claim of a guaranteed 30 FPS live preview is made; final video is fixed 30 FPS. Raw results are in adjacent JSON files and outputs/qa.
`,
);
await fs.writeFile(
  "docs/RENDER_QA_REPORT.md",
  `# Render QA — 2026-11-07

All three MP4s exist, were probed and completely decoded with FFmpeg. Final validation sidecars remain beside outputs. They are actual encoded videos, not screenshot-only demos.

| Video | Resolution | Frame rate | Codecs | Container duration | Render time |
|---|---|---|---|---|---|
${media.join("\n")}

Representative PNGs: outputs/qa includes frame 0, midpoint, near end and frames immediately before/after the first three message transitions for each video. Visual inspection covered complete status/navigation bars, avatars, bubble order, long Chinese/English/emoji text, original image and group scrolling. Older messages naturally leave the chat viewport while the fixed phone chrome remains intact.

Editor/export: same original-resolution frame 137, SSIM ${parity.ssim} (required >${parity.minimum}); no playback controls in the image. An earlier test incorrectly included controls and later hid the grid column; these were repaired before PASS, without lowering the threshold. Shared box sizing also prevents preview/export layout drift.

Repeat rendering: decoded video-frame hashes identical, SHA256 ${sync.deterministic_frame_hash}. Ten effect onsets differ from planned frame time by about 7–8ms, below 33.33ms. Full MP4 decode passed for all three. PCM peak of text-demo mix ${sync.peak_pcm}; final audio uses a limiter. This verifies signal/timing and decoding, not a human subjective listening review.

Example B final audio is genuine Edge zh-CN-YunxiNeural and zh-CN-XiaoxiaoNeural, probed at 3144ms and 3288ms; displayed as 4 seconds using ceiling. Voice animation uses the same rounded frame interval as playback. Windows offline male/female synthesis was also executed; its samples remain locally under outputs/qa and are not in the current public source snapshot. Manual human listening on physical speakers is NOT RUN by the agent; use the delivered MP4s for subjective acceptance.

Batch isolation: malformed 00-invalid.json failed, subsequent 01-valid.json rendered successfully; results/logs retained. Editor import → export → progress/download → MP4 probe → reload → persisted queue file was exercised by tests/export.ts. No remote TTS is used in deterministic CI rendering.
`,
);
await fs.writeFile(
  "docs/FINAL_REPORT.md",
  `# ChatStory Studio delivery — 2026-11-07

Usable local end-to-end prerelease candidate, not a claim of stable v1.0.0 or completed public publication. Project is isolated in chatstory-studio; original work and two reference checkouts remain untouched outside it.

## Executed commands

- git clone both requested repositories; inspected actual trees, license absence, entrypoints and media paths.
- Upstream main: npm ci --ignore-scripts, npm run build, npm test: build PASS, 123 passed / 0 failed / 0 skipped. Initial restricted-user filesystem/account failures were rerun in the normal authorized Windows environment.
- New project: npm install, safe dependency upgrades, npm audit fix; final npm audit reports 0 vulnerabilities.
- npm run check, npm run lint, npm run build.
- npm test and JSON reporter: ${unit.passed} passed, ${unit.failed} failed, ${unit.skipped} skipped in ${unit.files.length} test files. A temporary cold-copy duplication was removed by explicit test includes; counts are not inflated.
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
${media.join("\n")}

Each output includes source JSON, prepared Story, log, validation JSON, JPG and SRT. Source/assets/examples are committed; generated videos, private projects, uploaded media and runtime caches are not committed. Full decode, representative-frame review, timing, repeat-frame hashes, editor export and parity checks are described in RENDER_QA_REPORT.md with machine-readable evidence.

## Acceptance mapping

1–4: local service, nonblocking React UI, status controls and complete 1080×1920 phone — PASS in UI, cold and visual tests.
5–7: varied messages, smooth scrolling and synchronized original effects — PASS, 10 effect onset checks within one frame.
8–9: real Edge male/female audio, probe-based seconds — synthesis/probe/decode PASS; subjective speaker listening not performed by agent.
10–14: long mixed text, three independent examples, correct parameters, both tracks and complete decode — PASS on supplied examples.
15–16: isolated batch failure and identical repeat decoded video frames — PASS.
17–18: fixed chrome not cropped; editor/export same-frame SSIM ${parity.ssim} — PASS.

## Implemented scope and limits

Original device/chat UI, editor CRUD/reorder, roles/avatars, appearance templates, frame timing, typing/pop/scroll, playable/animated voice bars, Edge/offline/local audio/cache, original effects/volume/mute/limiter, schema, save/import/export, serial persisted queue/retry, CLI/batch, artifacts, probe/decode QA, docs and CI configuration are implemented.

Do not claim stable completeness: finance/contact visuals are simplified; recall is currently a notice rather than targeted history deletion; extremely tall single bubbles should be split; queue restarts from beginning rather than resuming a partial encode. Voice settings cache invalidation is automatic through UI; externally edited JSON with a fixed audio_path intentionally retains that recording. No Electron installer or AI story-writing model is included. No public remote CI result exists before authorized publication.

## Licensing / security / operation

No upstream code/assets copied because actual license files were absent. Own code is MIT; Remotion custom eligibility/company-license requirements, media-binary GPL/LGPL terms and speech-service/platform conditions remain independent. Full notices and inventory are preserved. Core functionality never calls upstream login, recharge or credit services; no paid calls or credentials were used.

Host/Origin checks, loopback binding, safe subprocess arguments, realpath asset confinement and color/path validation are implemented. Local secret/history pattern scan and dependency audit passed; public CI adds gitleaks. No claim of exhaustive security proof is made.

Start: npm ci → npm run dev → http://127.0.0.1:3210 (or start-windows.cmd). Use README's render/batch commands. Edge CLI is optional when cached/local audio is used. FFmpeg/FFprobe installed by npm; first render downloads a browser unless CHROME_PATH is supplied. All evidence and MP4 files remain on disk.

Last committed source checkpoint when this report was generated: ${sourceCommit}. Final immutable source commit is recorded in outputs/release/release-manifest.json after the final local commit. Git history contains stage checkpoints; this continuous implementation did not manufacture backdated per-phase histories.
`,
);
await fs.writeFile(
  "docs/OPEN_SOURCE_RELEASE_REPORT.md",
  `# Open-source release checkpoint — 2026-11-07

Project: ChatStory Studio. Version: 0.1.0 prerelease candidate. Own source: MIT, with independently licensed dependencies; see LICENSE_AUDIT.md. Architecture, performance, actual UI/media evidence and limits: ARCHITECTURE_REVIEW.md, PERFORMANCE_REPORT.md, RENDER_QA_REPORT.md and FINAL_REPORT.md.

GitHub CLI normal-user keyring login was successfully verified as hubooooo. The initial restricted-process authentication failure was environmental; no re-login/token disclosure was needed. Owner selection still requires user's confirmation. Lookup of hubooooo/chatstory-studio returned not found; this is a proposed name, not a created repository.

| Publication fact | Actual status |
|---|---|
| Actual repository URL | None created. Proposed: https://github.com/hubooooo/chatstory-studio |
| Public | No |
| Remote push | Not performed |
| Git source checkpoint | ${sourceCommit}; final hash in local release manifest |
| Remote Release / Tag | None |
| Remote CI | NOT RUN; workflow prepared for Windows and Ubuntu |
| Installer | None; source ZIP and Windows launcher prepared |
| Demo videos | Three real local MP4s, plus JSON and validation artifacts |

Public manifest for approval: current tracked source, configuration/lockfile, original phone/chat UI, tests, fictional JSON/examples, two cached fictional Edge MP3s, original SVG and tone assets, real editor screenshot, license texts, audits/docs, CI and contribution/security templates. Source ZIP excludes node_modules, .venv, .cache, user data/, generated outputs, runtime logs and unreviewed uploads. Optional Release attachments: reviewed source ZIP and the three fictional demonstration MP4/sidecars. No upstream checkout, proprietary font/icon/sound, credential or private conversation is intended for release.

Ready next action is user review of owner + name + public file manifest + prerelease version/attachments. The supplied task explicitly requires final confirmation before Public publication; no public repo or release has been created prematurely. After confirmation: create an independent attributed repository without overwriting an existing remote, push without force, set topics, run/inspect CI, create a prerelease only after checks succeed, then read back actual repository and Release state. v1.0.0 is not justified while the documented limitations and broader clean-machine acceptance remain.
`,
);
await fs.writeFile(
  "docs/PROJECT_STATUS.md",
  `# Phase checkpoints

- Phase 0: audited actual upstream code/licenses/environment; original project builds and 123 tests pass. License-safe independent implementation chosen.
- Phases 1–4: shared phone/chat editor, timeline, real media/speech, schema, CLI/batch and persisted queue implemented and exercised.
- Phase 5: three real videos, probe/decode, before/after/middle/end frames, deterministic hashes, effect sync and editor/export parity tested. Limitations explicitly documented, not stable v1.
- Phase 6: architecture, product workflow, render and measured performance review completed on this machine; cold source-copy installation passed. Fresh-OS and subjective human listening remain outside agent validation.
- Phase 7: original brand, bilingual docs, license inventory, privacy defaults, source audit, contribution/security/issue templates and CI prepared.
- Phase 8: normal-user GitHub authentication valid; repository/owner/public-content confirmation pending. No public repository, remote CI or Release falsely claimed.
`,
);
console.log(
  "Final architecture, performance, media and release reports generated",
);
