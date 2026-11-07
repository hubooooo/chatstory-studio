import { createEffects } from "../src/audio/effects";
import { windowsSpeech } from "../src/tts/windows";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";
import ffmpeg from "ffmpeg-static";
import probePackage from "ffprobe-static";
import { createHash } from "node:crypto";
import { synthesize } from "../src/tts/edge";
import type { Story } from "../src/schema/story";
export const ROOT = process.cwd();
export const PUBLIC = path.join(ROOT, "public");
export const bin = process.env.FFMPEG_PATH || ffmpeg!;
export const probeBin = process.env.FFPROBE_PATH || probePackage.path;
export function run(
  exe: string,
  args: string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawn(exe, args, { ...options, windowsHide: true, shell: false });
    let out = "",
      err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("error", (e) =>
      reject(
        new Error(
          (e as NodeJS.ErrnoException).code === "ENOENT"
            ? `缺少 ${path.basename(exe)}。请重新 npm ci 或设置媒体工具路径。`
            : e.message,
        ),
      ),
    );
    p.on("close", (code) =>
      code === 0
        ? resolve(out)
        : reject(
            new Error(
              `${path.basename(exe)} exit ${code}: ${err.slice(-4000)}`,
            ),
          ),
    );
  });
}
export async function assetPath(relative: string) {
  const full = path.resolve(PUBLIC, relative);
  const root = await fs.realpath(PUBLIC);
  const real = await fs.realpath(full);
  if (!real.startsWith(root + path.sep)) throw new Error("资源路径越界");
  return real;
}
export async function probe(file: string) {
  return JSON.parse(
    await run(probeBin, [
      "-v",
      "error",
      "-show_streams",
      "-show_format",
      "-of",
      "json",
      file,
    ]),
  );
}
export async function videoFrameHash(file:string){const data=await run(bin,['-v','error','-i',file,'-map','0:v:0','-f','framemd5','-']);return createHash('sha256').update(data.split('\n').filter(x=>x&&!x.startsWith('#')).join('\n')).digest('hex');}
export const initEffects = () => createEffects(PUBLIC);
export async function prepareStory(input: Story) {
  const s = structuredClone(input);
  await initEffects();
  for (const c of s.characters) if (c.avatar) await assetPath(c.avatar);
  if (s.theme.wallpaper) await assetPath(s.theme.wallpaper);
  for (const m of s.messages) {
    if (m.asset_path) await assetPath(m.asset_path);
    if (m.type === "voice" && !m.audio_path) {
      const voice =
        m.voice_id || s.characters.find((c) => c.id === m.sender_id)!.voice_id;
      const hash = createHash("sha256")
        .update(
          JSON.stringify([
            m.text,
            voice,
            s.voice_settings.rate,
            s.voice_settings.backend,
          ]),
        )
        .digest("hex")
        .slice(0, 24);
      const rel = `assets/tts-${hash}.${s.voice_settings.backend === "windows" ? "wav" : "mp3"}`;
      const file = path.join(PUBLIC, rel);
      try {
        await fs.access(file);
      } catch {
        if (s.voice_settings.backend === "windows") {
          await windowsSpeech(
            m.text,
            voice,
            s.voice_settings.rate,
            file + ".tmp.wav",
          );
          await fs.rename(file + ".tmp.wav", file);
        } else {
          let audio: Buffer;
          try {
            audio = await synthesize(m.text, voice, s.voice_settings.rate);
          } catch (err) {
            throw new Error(
              `TTS 网络不可用；请导入本地录音或使用缓存。${String(err)}`,
            );
          }
          await fs.writeFile(file + ".tmp", audio);
          await fs.rename(file + ".tmp", file);
        }
      }
      m.audio_path = rel;
    }
    if (m.audio_path) {
      const p = await probe(await assetPath(m.audio_path));
      if (
        !p.streams.some((x: { codec_type: string }) => x.codec_type === "audio")
      )
        throw new Error(`${m.id}: 缺少音频轨`);
      m.audio_duration_ms = Math.round(Number(p.format.duration) * 1000);
      if (!Number.isFinite(m.audio_duration_ms) || m.audio_duration_ms <= 0)
        throw new Error(`${m.id}: 音频时长无效`);
    }
  }
  return s;
}
