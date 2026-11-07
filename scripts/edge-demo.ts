import fs from "node:fs/promises";
import { prepareStory } from "./media";
import { parseStory } from "../src/schema/story";
const b = JSON.parse(await fs.readFile("examples/demo-b.json", "utf8"));
b.voice_settings.backend = "edge";
for (const m of b.messages) {
  delete m.audio_path;
  delete m.audio_duration_ms;
}
try {
  const s = await prepareStory(parseStory(b));
  await fs.writeFile("examples/demo-b.json", JSON.stringify(s, null, 2));
  await fs.writeFile(
    "docs/edge-tts-results.json",
    JSON.stringify(
      {
        passed: true,
        backend: "Python edge-tts 7.3.1",
        voices: s.messages
          .filter((m) => m.type === "voice")
          .map((m) => ({
            id: m.id,
            audio: m.audio_path,
            ms: m.audio_duration_ms,
          })),
      },
      null,
      2,
    ),
  );
  console.log("Edge TTS male/female PASS");
} catch (e) {
  await fs.writeFile(
    "docs/edge-tts-results.json",
    JSON.stringify({ passed: false, error: String(e) }, null, 2),
  );
  console.error(e);
  process.exitCode = 1;
}
