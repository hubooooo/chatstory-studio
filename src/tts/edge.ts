import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
export async function synthesize(
  text: string,
  voice: string,
  rate: string,
): Promise<Buffer> {
  const file = path.join(os.tmpdir(), `chatstory-${randomUUID()}.mp3`);
  let executable = process.env.EDGE_TTS_PATH || "edge-tts";
  if (!process.env.EDGE_TTS_PATH) {
    const local = path.resolve(
      ".venv",
      process.platform === "win32" ? "Scripts/edge-tts.exe" : "bin/edge-tts",
    );
    try {
      await fs.access(local);
      executable = local;
    } catch {
      /* PATH remains supported. */
    }
  }
  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(
        executable,
        [
          `--text=${text}`,
          "--voice",
          voice,
          `--rate=${rate}`,
          "--write-media",
          file,
        ],
        { shell: false, windowsHide: true },
      );
      const timer = setTimeout(() => {
        child.kill();
        reject(new Error("Edge TTS 连接超时（45 秒）"));
      }, 45000);
      let error = "";
      child.stderr.on("data", (d) => (error += d));
      child.on("error", (e) => {
        clearTimeout(timer);
        reject(
          new Error(
            `无法运行 edge-tts，请安装 Python 和 pip install edge-tts，或导入本地音频。${e.message}`,
          ),
        );
      });
      child.on("close", (code) => {
        clearTimeout(timer);
        if (code === 0) resolve();
        else reject(new Error(`Edge TTS exit ${code}: ${error.slice(-1500)}`));
      });
    });
    return await fs.readFile(file);
  } finally {
    await fs.rm(file, { force: true });
  }
}
