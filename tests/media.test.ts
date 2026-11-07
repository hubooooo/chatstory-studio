import { it, expect } from "vitest";
import { run, bin, probe, assetPath } from "../scripts/media";
it("reports missing media program with recovery instructions", async () => {
  await expect(
    run("chatstory-nonexistent-executable-42.exe", []),
  ).rejects.toThrow("缺少");
});
it("executes real FFmpeg", async () => {
  expect(await run(bin, ["-version"])).toContain("ffmpeg version");
});
it("probes cached male and female Edge audio duration", async () => {
  for (const file of [
    "public/assets/tts-10cb8d6d7a2035c61d152cc7.mp3",
    "public/assets/tts-ff871e3d2b5d3dfbd85db86a.mp3",
  ]) {
    const p = await probe(file);
    expect(Number(p.format.duration)).toBeGreaterThan(3);
    expect(p.streams[0].codec_type).toBe("audio");
  }
});
it("rejects real path outside public", async () => {
  await expect(assetPath("../package.json")).rejects.toThrow("资源路径越界");
});
