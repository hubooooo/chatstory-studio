# Architecture review — 2026-11-07

Single Story model: src/schema/story.ts, runtime Zod validation plus generated JSON Schema. src/timeline compiles stable frame events and deterministic scroll offsets. src/render/Video.tsx owns the shared scene used by Player and renderer. Phone and Conversation contain no filesystem or server dependencies. No upstream code or account/payment/analytics modules were copied.

Node boundaries: scripts/media.ts centralizes safe subprocess execution, probing, resource confinement and voice preparation. src/audio/effects.ts generates original tone assets. src/tts contains independent Edge CLI and Windows adapters. scripts/pipeline.ts owns bundling, MP4 encoding, limiting, artifact generation and probing; both CLI and server call it. scripts/server.ts binds loopback, persists jobs under data/, serializes rendering, stores projects and handles uploads. Editor uses these same APIs.

Audit fixes: bounded audio Sequence lifetimes prevent Player tag exhaustion; controls moved outside the phone; scoped box sizing shared between preview/export; bundles refreshed for new uploads; raw source saved separately from prepared Story; preparation failures now write logs; retry restores original job; uploaded/generated media are ignored except explicitly reviewed sample assets; changing UI voice/rate clears synthesized caches; no shell interpolation for media or speech.

No incompatible message definitions or duplicate render UIs found. Generic process helper is shared. Compact single-package layout retained instead of speculative monorepo. To add a theme, extend Phone/Conversation using Story; to add a voice engine, extend preparation and its backend enum, retaining real-duration probing. Some developer validation scripts intentionally live in scripts/ and tests/ rather than product packages.

Limits: simplified finance/card visuals; recall notice does not target a prior bubble; estimated row layout needs a future measured layout for exceptionally tall single messages; queue retries from the start, not mid-frame. Public network deployment is outside the supported local-only model.
