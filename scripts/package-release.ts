import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { run, ROOT } from "./media";
const out = path.join(ROOT, "outputs", "release");
await fs.mkdir(out, { recursive: true });
const safe = `safe.directory=${ROOT.replaceAll("\\", "/")}`;
const status = await run("git", ["-c", safe, "status", "--porcelain"]);
if (status.trim()) throw new Error("请先提交最终源文件，确保打包版本可重复");
const commit = (await run("git", ["-c", safe, "rev-parse", "HEAD"])).trim();
const source = "chatstory-studio-0.1.0-source.zip";
await run("git", [
  "-c",
  safe,
  "archive",
  "--format=zip",
  "--prefix=chatstory-studio/",
  "--output",
  path.join(out, source),
  "HEAD",
]);
const files = [source];
for (const name of ["demo-a", "demo-b", "demo-c"])
  for (const ext of [
    "mp4",
    "jpg",
    "srt",
    "source.json",
    "story.json",
    "validation.json",
    "log",
  ]) {
    const dest = path.join(out, `${name}.${ext}`);
    let data = await fs.readFile(`outputs/${name}.${ext}`);
    if (ext === "validation.json") {
      const v = JSON.parse(data.toString());
      v.media.format.filename = `${name}.mp4`;
      data = Buffer.from(JSON.stringify(v, null, 2));
    }
    await fs.writeFile(dest, data);
    files.push(`${name}.${ext}`);
  }
const artifacts = [];
for (const name of files) {
  const b = await fs.readFile(path.join(out, name));
  artifacts.push({
    file: name,
    bytes: b.length,
    sha256: createHash("sha256").update(b).digest("hex"),
  });
}
const source_files = (
  await run("git", ["-c", safe, "ls-tree", "-r", "--name-only", "HEAD"])
)
  .trim()
  .split("\n");
await fs.writeFile(
  path.join(out, "release-manifest.json"),
  JSON.stringify(
    {
      project: "ChatStory Studio",
      version: "0.1.0",
      prerelease: true,
      commit,
      public: false,
      repository_created: false,
      proposed_repository: "https://github.com/hubooooo/chatstory-studio",
      owner_confirmed: false,
      source_files,
      artifacts,
      excluded: [
        "node_modules",
        ".venv",
        ".cache",
        "data",
        "outputs",
        "unreviewed user uploads",
      ],
      publication:
        "Awaiting final user confirmation of owner/content; no remote write performed.",
    },
    null,
    2,
  ),
);
await fs.writeFile(
  path.join(out, "SHA256SUMS.txt"),
  artifacts.map((a) => `${a.sha256}  ${a.file}`).join("\n") + "\n",
);
console.log(
  `Prepared ${artifacts.length} artifacts from ${commit}; no publication`,
);
