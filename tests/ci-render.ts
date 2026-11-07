import fs from "node:fs/promises";
import { renderStory } from "../scripts/pipeline";
import { videoFrameHash } from "../scripts/media";
const s = JSON.parse(await fs.readFile("examples/demo-a.json", "utf8"));
s.messages = s.messages.slice(0, 2);
s.render_settings.tail_ms = 200;
await renderStory(s, "outputs/ci-smoke.mp4");
await renderStory(s, "outputs/ci-repeat.mp4");
if (
  (await videoFrameHash("outputs/ci-smoke.mp4")) !==
  (await videoFrameHash("outputs/ci-repeat.mp4"))
)
  throw new Error("CI repeat frame hashes differ");
console.log("Deterministic offline render PASS");
