# Open-source release checkpoint — 2026-11-07

Project: ChatStory Studio. Version: 0.1.0 prerelease candidate. Own source: MIT, with independently licensed dependencies; see LICENSE_AUDIT.md. Architecture, performance, actual UI/media evidence and limits: ARCHITECTURE_REVIEW.md, PERFORMANCE_REPORT.md, RENDER_QA_REPORT.md and FINAL_REPORT.md.

GitHub CLI normal-user keyring login was successfully verified as hubooooo. The initial restricted-process authentication failure was environmental; no re-login/token disclosure was needed. Owner selection still requires user's confirmation. Lookup of hubooooo/chatstory-studio returned not found; this is a proposed name, not a created repository.

| Publication fact | Actual status |
|---|---|
| Actual repository URL | None created. Proposed: https://github.com/hubooooo/chatstory-studio |
| Public | No |
| Remote push | Not performed |
| Git source checkpoint | 580ecf8a1f10c20d2deda0b87df2f915005dcc47; final hash in local release manifest |
| Remote Release / Tag | None |
| Remote CI | NOT RUN; workflow prepared for Windows and Ubuntu |
| Installer | None; source ZIP and Windows launcher prepared |
| Demo videos | Three real local MP4s, plus JSON and validation artifacts |

Public manifest for approval: current tracked source, configuration/lockfile, original phone/chat UI, tests, fictional JSON/examples, two cached fictional Edge MP3s, original SVG and tone assets, real editor screenshot, license texts, audits/docs, CI and contribution/security templates. Source ZIP excludes node_modules, .venv, .cache, user data/, generated outputs, runtime logs and unreviewed uploads. Optional Release attachments: reviewed source ZIP and the three fictional demonstration MP4/sidecars. No upstream checkout, proprietary font/icon/sound, credential or private conversation is intended for release.

Ready next action is user review of owner + name + public file manifest + prerelease version/attachments. The supplied task explicitly requires final confirmation before Public publication; no public repo or release has been created prematurely. After confirmation: create an independent attributed repository without overwriting an existing remote, push without force, set topics, run/inspect CI, create a prerelease only after checks succeed, then read back actual repository and Release state. v1.0.0 is not justified while the documented limitations and broader clean-machine acceptance remain.
