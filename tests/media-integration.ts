import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { renderStory } from "../scripts/pipeline";
import { probe, run, bin } from "../scripts/media";
import { parseStory } from "../src/schema/story";
import { timeline } from "../src/timeline";
const s = parseStory(
  JSON.parse(await fs.readFile("examples/demo-a.json", "utf8")),
);
await renderStory(s, "outputs/qa/repeat-a.mp4");
async function checksum(file: string) {
  const data = await run(bin, [
    "-v",
    "error",
    "-i",
    file,
    "-map",
    "0:v:0",
    "-f",
    "framemd5",
    "-",
  ]);
  return createHash("sha256")
    .update(
      data
        .split("\n")
        .filter((x) => x && !x.startsWith("#"))
        .join("\n"),
    )
    .digest("hex");
}
const a = await checksum("outputs/demo-a.mp4"),
  b = await checksum("outputs/qa/repeat-a.mp4");
if (a !== b) throw new Error("重复渲染帧内容不同");
await run(bin, [
  "-y",
  "-i",
  "outputs/demo-a.mp4",
  "-map",
  "0:a:0",
  "-ac",
  "1",
  "-ar",
  "48000",
  "-f",
  "f32le",
  "outputs/qa/audio.f32",
]);
const pcm = await fs.readFile("outputs/qa/audio.f32");
const sync = timeline(s).map((e) => {
  const target = e.start / 30;
  let onset = -1;
  for (
    let i = Math.max(0, Math.floor((target - 0.04) * 48000));
    i < Math.min(pcm.length / 4, Math.ceil((target + 0.12) * 48000));
    i++
  )
    if (Math.abs(pcm.readFloatLE(i * 4)) > 0.002) {
      onset = i / 48000;
      break;
    }
  const delta = onset - target;
  if (onset < 0 || Math.abs(delta) > 1 / 30)
    throw new Error(`${e.message.id} 提示音同步超出一帧: ${delta}`);
  return {
    id: e.message.id,
    target_s: target,
    onset_s: onset,
    delta_ms: delta * 1000,
  };
});
let peak = 0;
for (let i = 0; i < pcm.length; i += 4)
  peak = Math.max(peak, Math.abs(pcm.readFloatLE(i)));
if (peak >= 1 || peak < 0.002) throw new Error("音轨静音或削波");
for (const name of ["demo-a", "demo-b", "demo-c"]) {
  const p = await probe(`outputs/${name}.mp4`);
  if (p.streams.length < 2) throw new Error("缺少媒体轨");
  await run(bin, [
    "-v",
    "error",
    "-i",
    `outputs/${name}.mp4`,
    "-f",
    "null",
    "-",
  ]);
}
await fs.writeFile(
  "docs/media-integration.json",
  JSON.stringify(
    {
      passed: true,
      deterministic_frame_hash: a,
      sync,
      peak_pcm: peak,
      decode_videos: 3,
    },
    null,
    2,
  ),
);
console.log("Repeat render frame hashes, 10 SFX onsets, decode: PASS");
