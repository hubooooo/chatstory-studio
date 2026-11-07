import fs from "node:fs/promises";
import path from "node:path";
export async function createEffects(publicDir: string) {
  await fs.mkdir(path.join(publicDir, "assets"), { recursive: true });
  for (const [i, name] of [
    "send",
    "receive",
    "keyboard",
    "start",
    "end",
    "click",
    "recall",
    "none",
  ].entries()) {
    const file = path.join(publicDir, "assets", `${name}.wav`);
    try {
      await fs.access(file);
      continue;
    } catch {
      /* Generate original PCM tones, no third-party assets. */
    }
    const rate = 48000,
      n = Math.round(rate * 0.12),
      b = Buffer.alloc(44 + n * 2);
    b.write("RIFF");
    b.writeUInt32LE(36 + n * 2, 4);
    b.write("WAVEfmt ", 8);
    b.writeUInt32LE(16, 16);
    b.writeUInt16LE(1, 20);
    b.writeUInt16LE(1, 22);
    b.writeUInt32LE(rate, 24);
    b.writeUInt32LE(rate * 2, 28);
    b.writeUInt16LE(2, 32);
    b.writeUInt16LE(16, 34);
    b.write("data", 36);
    b.writeUInt32LE(n * 2, 40);
    for (let t = 0; t < n; t++)
      b.writeInt16LE(
        name === "none"
          ? 0
          : Math.round(
              Math.sin((2 * Math.PI * (440 + i * 110) * t) / rate) *
                Math.sin((Math.PI * t) / n) *
                4500,
            ),
        44 + t * 2,
      );
    await fs.writeFile(file, b);
  }
}
