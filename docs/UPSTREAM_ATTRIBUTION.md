# Upstream provenance

Inspected 2026-11-07; isolated checkouts retained in the parent workspace, not included in our repository.

| Repository | Exact commit | License evidence | Reused / modified / redistributed |
|---|---|---|---|
| https://github.com/gaopengbin/wechat-dialog-generator | 0e64ddb3b1a6843cc92218270bb539a0b2a6b352 | README says MIT and links ./LICENSE, but actual tree contains no LICENSE file. Exact grant and copyright notice unresolved. | None / none / none |
| https://github.com/AmirPhenomenal/fake-chat | 0942acb352d66c1457e7a0add461166b9ab7eaf9 | No actual LICENSE found. | None / none / none |

Main repository inspection included package.json, src/types.ts, PhonePreview, phone chrome, capture modules, account/payment modules and tests. Its build passed; 123 tests passed, 0 failed, 0 skipped. Voice bubbles use configured duration and image capture does not provide the requested video/real-audio pipeline.

Reference inspection included src/video.js and dependencies. It uses html-to-image snapshots and mediabunny/WebCodecs, with fixed message gaps and codec fallback. We used only the general idea of deterministic frame rendering. We independently wrote a Remotion pipeline rather than porting its code. Its assets/sound/fonts were not copied. Since no code reuse was authorized, installing/running its UI was not necessary for our no-copy decision and was not performed.

Independent additions: complete phone/UI components, Chinese editor, Zod Story v1 schema, deterministic timeline, Remotion Player/render compositions, Node queue/CLI, media probing, original effects, separately installed Edge CLI adapter, Windows offline speech adapter, batch artifacts, tests and all product documentation. Familiar visual conventions are recreated from scratch; this project does not claim ownership of the WeChat trademark or upstream work.

No changes were made to upstream authentication, payments, credits, quotas or production servers. No upstream service is required by local core functionality.
