import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { run, probe, bin } from "./media";
const repository = "hubooooo/chatstory-studio",
  tagName = "v0.1.0",
  runId = "42355944377";
const api = async (p: string) => JSON.parse(await run("gh", ["api", p]));
const repo = await api(`repos/${repository}`);
const release = await api(`repos/${repository}/releases/tags/${tagName}`);
const tag = await api(`repos/${repository}/git/ref/tags/${tagName}`);
const ci = await api(`repos/${repository}/actions/runs/${runId}`);
const jobs = await api(`repos/${repository}/actions/runs/${runId}/jobs`);
const manifest = JSON.parse(
  await fs.readFile("outputs/release/release-manifest.json", "utf8"),
);
if (repo.visibility !== "public" || release.draft || !release.prerelease)
  throw new Error("Repository/release visibility mismatch");
if (
  tag.object.sha !== manifest.commit ||
  ci.head_sha !== manifest.commit ||
  ci.conclusion !== "success"
)
  throw new Error(
    "Tag, source archive and passing CI must identify the same commit",
  );
const verified = [];
for (const item of manifest.artifacts) {
  const asset = release.assets.find(
    (a: { name: string }) => a.name === item.file,
  );
  if (
    !asset ||
    asset.state !== "uploaded" ||
    asset.size !== item.bytes ||
    asset.digest !== `sha256:${item.sha256}`
  )
    throw new Error(`Remote asset mismatch: ${item.file}`);
  verified.push({
    name: asset.name,
    bytes: asset.size,
    sha256: item.sha256,
    url: asset.browser_download_url,
  });
}
const downloaded = ".cache/published-verification";
await fs.mkdir(downloaded, { recursive: true });
await run("gh", [
  "release",
  "download",
  tagName,
  "--repo",
  repository,
  "--dir",
  downloaded,
  "--clobber",
]);
for (const name of [
  ...manifest.artifacts.map((x: { file: string }) => x.file),
  "release-manifest.json",
  "SHA256SUMS.txt",
]) {
  const local = await fs.readFile(path.join("outputs/release", name)),
    remote = await fs.readFile(path.join(downloaded, name));
  if (
    createHash("sha256").update(local).digest("hex") !==
    createHash("sha256").update(remote).digest("hex")
  )
    throw new Error(`Downloaded bytes mismatch: ${name}`);
}
const media = [];
for (const name of ["demo-a", "demo-b", "demo-c"]) {
  const file = path.join(downloaded, name + ".mp4");
  const p = await probe(file),
    v = p.streams.find((s: { codec_type: string }) => s.codec_type === "video"),
    a = p.streams.find((s: { codec_type: string }) => s.codec_type === "audio");
  if (
    v.width !== 1080 ||
    v.height !== 1920 ||
    v.r_frame_rate !== "30/1" ||
    v.codec_name !== "h264" ||
    a.codec_name !== "aac"
  )
    throw new Error("Published MP4 format mismatch");
  await run(bin, ["-v", "error", "-i", file, "-f", "null", "-"]);
  media.push({
    file: name + ".mp4",
    width: v.width,
    height: v.height,
    fps: v.r_frame_rate,
    video: v.codec_name,
    audio: a.codec_name,
    decode: "PASS",
  });
}
const receipt = {
  verified: true,
  verified_at_utc: new Date().toISOString(),
  repository_url: repo.html_url,
  public: true,
  release_url: release.html_url,
  tag: tagName,
  commit: tag.object.sha,
  prerelease: release.prerelease,
  draft: release.draft,
  published_at_utc: release.published_at,
  published_at_shanghai: new Date(release.published_at).toLocaleString(
    "zh-CN",
    { timeZone: "Asia/Shanghai", hour12: false },
  ),
  ci: {
    id: ci.id,
    url: ci.html_url,
    conclusion: ci.conclusion,
    commit: ci.head_sha,
    jobs: jobs.jobs.map((j: { name: string; conclusion: string }) => ({
      name: j.name,
      conclusion: j.conclusion,
    })),
  },
  remote_assets: release.assets.length,
  verified_artifacts: verified,
  downloaded_files_verified: manifest.artifacts.length + 2,
  downloaded_media: media,
  installer: false,
};
await fs.writeFile(
  "docs/github-publication.json",
  JSON.stringify(receipt, null, 2),
);
console.log(
  JSON.stringify({
    verified: true,
    repository: receipt.repository_url,
    release: receipt.release_url,
    commit: receipt.commit,
    ci: receipt.ci.conclusion,
    downloaded_files_verified: receipt.downloaded_files_verified,
  }),
);
