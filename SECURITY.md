# Security and privacy

This application is intended for a trusted local desktop. It binds 127.0.0.1, checks Host/Origin on API requests, rejects traversal/absolute/remote asset paths, resolves symlinks against public/, and invokes media tools without a shell. Do not expose it to a LAN or public internet without an independent authentication and hardening review. Imported media are parsed by external tools: keep dependencies updated and only use trusted files.

No telemetry or upstream accounts are required. Online Edge synthesis sends the selected speech text to Microsoft. Projects are stored in data/, uploads/caches in public/assets/, output in outputs/. The latter directories can contain private data; inspect your Git staging area before sharing. Bundled sample audio is fictional. Pattern-based secret scanning is available via `npx tsx scripts/security.ts`; CI additionally runs gitleaks and npm audit.

Do not disclose secrets or sensitive examples in public issues. After publication, use GitHub Private Vulnerability Reporting when enabled, or request a private maintainer contact without including exploit data. There is currently no published repository or invented security email address. Only the latest prerelease candidate is maintained; no long-term support guarantee is made.
