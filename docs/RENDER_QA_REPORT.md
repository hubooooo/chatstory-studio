# Render QA — 2026-11-07

All three MP4s exist, were probed and completely decoded with FFmpeg. Final validation sidecars remain beside outputs. They are actual encoded videos, not screenshot-only demos.

| Video | Resolution | Frame rate | Codecs | Container duration | Render time |
|---|---|---|---|---|---|
| demo-a | 1080×1920 | 30/1 | h264 / aac | 9.152000s | 20139ms |
| demo-b | 1080×1920 | 30/1 | h264 / aac | 12.950000s | 24809ms |
| demo-c | 1080×1920 | 30/1 | h264 / aac | 10.752000s | 25075ms |

Representative PNGs: outputs/qa includes frame 0, midpoint, near end and frames immediately before/after the first three message transitions for each video. Visual inspection covered complete status/navigation bars, avatars, bubble order, long Chinese/English/emoji text, original image and group scrolling. Older messages naturally leave the chat viewport while the fixed phone chrome remains intact.

Editor/export: same original-resolution frame 137, SSIM 0.988771 (required >0.96); no playback controls in the image. An earlier test incorrectly included controls and later hid the grid column; these were repaired before PASS, without lowering the threshold. Shared box sizing also prevents preview/export layout drift.

Repeat rendering: decoded video-frame hashes identical, SHA256 46ceae0db05e5c4e0a26f9728ce3cc6f7dd11b0a9f96001d15dfca22824085ab. Ten effect onsets differ from planned frame time by about 7–8ms, below 33.33ms. Full MP4 decode passed for all three. PCM peak of text-demo mix 0.03432187810540199; final audio uses a limiter. This verifies signal/timing and decoding, not a human subjective listening review.

Example B final audio is genuine Edge zh-CN-YunxiNeural and zh-CN-XiaoxiaoNeural, probed at 3144ms and 3288ms; displayed as 4 seconds using ceiling. Voice animation uses the same rounded frame interval as playback. Windows offline male/female synthesis was also executed; its samples remain locally under outputs/qa and are not in the current public source snapshot. Manual human listening on physical speakers is NOT RUN by the agent; use the delivered MP4s for subjective acceptance.

Batch isolation: malformed 00-invalid.json failed, subsequent 01-valid.json rendered successfully; results/logs retained. Editor import → export → progress/download → MP4 probe → reload → persisted queue file was exercised by tests/export.ts. No remote TTS is used in deterministic CI rendering.
