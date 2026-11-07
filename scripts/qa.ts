import fs from "node:fs/promises";
import path from "node:path";
import { probe, run, bin, ROOT } from "./media";
import { batch, renderStory } from "./pipeline";
import { parseStory } from "../src/schema/story";
import { timeline } from "../src/timeline";
const out = path.join(ROOT, "outputs", "qa");
await fs.mkdir(out, { recursive: true });
const report: Record<string, unknown> = {};
for (const name of ["demo-a", "demo-b", "demo-c"]) {
  const input = path.join(ROOT, "outputs", name + ".mp4");
  const p = await probe(input);
  const seconds = Number(p.format.duration);
  const s = parseStory(
    JSON.parse(await fs.readFile(`outputs/${name}.story.json`, "utf8")),
  );
  const frames = [
    0,
    Math.round(seconds * 15),
    Math.max(0, Math.floor(seconds * 30) - 2),
    ...timeline(s)
      .slice(0, 3)
      .flatMap((e) => [e.start - 1, e.start + e.animation + 1]),
  ].filter((n) => n >= 0);
  for (const frame of [...new Set(frames)])
    await run(bin, [
      "-y",
      "-i",
      input,
      "-vf",
      `select=eq(n\\,${frame})`,
      "-frames:v",
      "1",
      `${out}/${name}-${frame}.png`,
    ]);
  await run(bin, ["-y", "-i", input, "-f", "null", "-"]);
  report[name] = {
    seconds,
    frames,
    decode: "PASS",
    audio: s.messages
      .filter((m) => m.audio_path)
      .map((m) => ({
        id: m.id,
        path: m.audio_path,
        probed_ms: m.audio_duration_ms,
        display_seconds: Math.ceil(m.audio_duration_ms! / 1000),
      })),
  };
}
await fs.writeFile("docs/media-qa.json", JSON.stringify(report, null, 2));
if(process.argv.includes('--frames-only'))process.exit(0);
const scripts = path.join(out, "failure-input");
await fs.mkdir(scripts, { recursive: true });
await fs.writeFile(path.join(scripts, "00-invalid.json"), "{broken");
const small = JSON.parse(await fs.readFile("examples/demo-a.json", "utf8"));
small.messages = small.messages.slice(0, 2);
small.render_settings.tail_ms = 200;
await fs.writeFile(path.join(scripts, "01-valid.json"), JSON.stringify(small));
const isolated = await batch(scripts, path.join(out, "isolation"));
if (isolated[0]?.ok || !isolated[1]?.ok) throw new Error("单条失败隔离失败");
await fs.writeFile(
  "docs/batch-isolation.json",
  JSON.stringify(isolated, null, 2),
);
const benchmarks = [];
for (const seconds of [30, 60]) {
  const s = parseStory(small);
  s.render_settings.tail_ms = seconds * 1000 - 500 - 800 - 240;
  const r = await renderStory(s, path.join(out, `benchmark-${seconds}.mp4`));
  benchmarks.push({
    video_seconds: seconds,
    render_ms: r.elapsed_ms,
    memory_rss_bytes: process.memoryUsage().rss,
  });
}
await fs.writeFile(
  "docs/performance-results.json",
  JSON.stringify(
    {
      benchmarks,
      notes:
        "RSS is Node parent process after rendering; not total or peak browser memory.",
    },
    null,
    2,
  ),
);
console.log(
  "QA decode, representative frames, failure isolation and 30/60s benchmarks complete",
);
