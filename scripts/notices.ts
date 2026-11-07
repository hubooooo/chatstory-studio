import fs from "node:fs/promises";
import path from "node:path";
const lock = JSON.parse(await fs.readFile("package-lock.json", "utf8"));
const inventory = [];
await fs.mkdir("docs/licenses", { recursive: true });
for (const [folder, entry] of Object.entries(lock.packages) as [
  string,
  { version?: string; license?: string },
][]) {
  if (!folder) continue;
  try {
    const p = JSON.parse(
      await fs.readFile(path.join(folder, "package.json"), "utf8"),
    );
    inventory.push({
      name: p.name,
      version: p.version,
      license: p.license,
      repository: p.repository?.url || p.repository,
      lock_path: folder,
    });
  } catch {
    inventory.push({
      name: folder,
      version: entry.version,
      license: entry.license,
      installed: false,
    });
  }
}
await fs.writeFile(
  "docs/licenses/npm-inventory.json",
  JSON.stringify(inventory, null, 2),
);
for (const name of [
  "react",
  "react-dom",
  "remotion",
  "@remotion/player",
  "@remotion/renderer",
  "@remotion/bundler",
  "express",
  "zod",
  "ffmpeg-static",
  "ffprobe-static",
]) {
  const folder = path.join("node_modules", name);
  const files = await fs.readdir(folder);
  const license = files.find((x) => /^license(?:\.md|\.txt)?$/i.test(x));
  if (!license) throw new Error(`${name}: missing license`);
  await fs.copyFile(
    path.join(folder, license),
    path.join(
      "docs/licenses",
      name.replaceAll("/", "-").replace("@", "") + ".txt",
    ),
  );
}
await fs.copyFile(
  ".venv/Lib/site-packages/edge_tts-7.3.1.dist-info/licenses/LICENSE",
  "docs/licenses/python-edge-tts.txt",
);
console.log("License inventory and direct dependency texts captured");
