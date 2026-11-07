# Performance — measured 2026-11-07

Windows win32, Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz, 31.9 GiB RAM, Node v24.19.0. Remotion concurrency 2, 1080×1920, 30 FPS, local H.264/AAC encoding. These are one-machine measurements, not universal promises.

| Metric | Actual result |
|---|---|
| Isolated source npm ci, shared download cache | 33185 ms |
| Local service ready | 1573 ms |
| Import 100 messages through UI | 727 ms |
| Edit with 100 messages loaded | 96 ms |
| Observed preview frame changes during 2s | 26.93 FPS |
| 30-second video | 53919 ms |
| 60-second video | 105386 ms |
| Peak sampled renderer process-tree working set, 30s | 1.57 GiB, 73 samples |
| Measured memory-run wall time incl. sampling | 56799 ms |
| Three-project serial batch | 70030 ms |

Import/edit are end-to-end automation timings. Preview sampling counts distinct committed frame values, not monitor refresh rate. Browser rendering and automation overhead are included. Memory includes Node renderer and descendants, excludes separate editor service, samples approximately every 500ms plus CIM overhead and may miss very brief peaks. Parent-only post-render RSS in performance-results.json is not misrepresented as a process-tree peak.

Cold test ran in a fresh source copy under a Chinese/space path on this same Windows machine, using a shared npm cache; not a pristine OS. First-ever internet dependency/browser download time is network dependent and not separately benchmarked. No claim of a guaranteed 30 FPS live preview is made; final video is fixed 30 FPS. Raw results are in adjacent JSON files and outputs/qa.
