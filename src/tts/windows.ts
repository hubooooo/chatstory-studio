import path from "node:path";
import { spawn } from "node:child_process";
export async function windowsSpeech(
  text: string,
  voice: string,
  rate: string,
  file: string,
) {
  if (process.platform !== "win32")
    throw new Error("Windows SAPI 仅支持 Windows；请使用 Edge 或导入本地录音");
  const male = /Yunxi|Yunjian|Kangkang/i.test(voice);
  await new Promise<void>((resolve, reject) => {
    const p = spawn(
      "pwsh.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-File",
        path.resolve("src/tts/windows.ps1"),
        "-TextBase64",
        Buffer.from(text).toString("base64"),
        "-OutputFile",
        file,
        "-Gender",
        male ? "Male" : "Female",
        "-SpeechRate",
        String(Math.round(parseInt(rate) / 10)),
      ],
      { windowsHide: true, shell: false },
    );
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("error", reject);
    p.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(err || `SAPI exit ${code}`)),
    );
  });
}
