# Third-party notices

Our MIT license covers original ChatStory Studio source, original CSS, the original landscape SVG and synthesized PCM effect tones only. It does not relicense dependencies, voices, operating systems or fonts. No vendor logos, proprietary notification sounds, bundled fonts or third-party avatar photos are included.

| Component | Actual use | License / conditions |
|---|---|---|
| React / React DOM | UI and shared video components | MIT; full notices in docs/licenses |
| Remotion 4.0.541 and @remotion packages | Player, bundling, frame rendering | Custom Remotion License, **not MIT or an unrestricted OSI license**. Free eligibility includes individuals, qualifying nonprofits and for-profit organizations up to 3 employees; other users need a company license. No Remotion source modifications or relicensing here. Full text preserved. |
| Express, Zod | Loopback API / validation | MIT; full notices preserved |
| ffmpeg-static 5.3.0 | External command-line audio processing | Package LICENSE is GPLv3; downloaded FFmpeg binary has its own build/license obligations. Binary is installed from dependency, not committed or shipped in source ZIP. Respect binary redistribution/source obligations if bundling it later. |
| ffprobe-static 3.1.0 | External command-line probing | Wrapper MIT (Josh Johnston); included upstream media binaries have independent FFmpeg licensing. No binary included in our source archive. |
| Python edge-tts 7.3.1 | Optional separately installed CLI | LGPLv3 except MIT subtitle composer; unmodified, not bundled in source archive. Actual license copied to docs/licenses/python-edge-tts.txt. Service use is subject to Microsoft's terms; not a promise of permanent free availability. |
| Windows SAPI / voices | Optional offline fallback process | Windows proprietary platform component, not redistributed. Requires installed licensed OS/voices and PowerShell 7. Demo speech is generated from fictional original text; no voice model is distributed. |
| Microsoft YaHei / Segoe UI, platform emoji | System font lookup | Not bundled or relicensed; available fonts depend on host. Source archive has no font files. |
| Chrome Headless Shell | Remotion-renderer download | Separate Chromium license and third-party notices in its download. Not bundled in source archive. |

Full direct dependency texts: `docs/licenses/`. Installed/transitive package metadata and versions: `docs/licenses/npm-inventory.json`; integrity and source URLs: `package-lock.json`. Development tools retain their own licenses in installed packages.

The two requested upstream repositories are **references only**. Their exact commits, missing actual license-file evidence, and no-copy decision are in `docs/UPSTREAM_ATTRIBUTION.md`. Neither their code nor their brand/media assets is included. Earlier evaluation of the AGPL `edge-tts-universal` npm library was removed; the final package has no dependency on it and contains none of its implementation.

Generated demo MP3/WAV contain fictional sentences synthesized using the named voice engines. Original sentence copyright and our effect/SVG copyright do not grant rights to redistribute proprietary speech engines or claim endorsement by their vendors. Public Release attachments require a separate review/confirmation.
