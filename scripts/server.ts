import express from "express";
import { createServer } from "vite";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { parseStory } from "../src/schema/story";
import { prepareStory, ROOT } from "./media";
import { renderStory } from "./pipeline";
const app = express();
const port = Number(process.env.PORT || 3210);
const origin = `http://127.0.0.1:${port}`;
app.use((req, res, next) => {
  if (
    req.headers.origin &&
    ![origin, `http://localhost:${port}`].includes(req.headers.origin)
  )
    return void res.status(403).json({ error: "仅允许本机编辑器请求" });
  if (
    req.headers.host !== `127.0.0.1:${port}` &&
    req.headers.host !== `localhost:${port}`
  )
    return void res.status(403).end();
  next();
});
app.use(express.json({ limit: "20mb" }));
await fs.mkdir("data", { recursive: true });
app.use("/outputs", express.static(path.join(ROOT, "outputs")));
const jobs: {
  id: string;
  title: string;
  status: string;
  progress: number;
  error?: string;
  url?: string;
  story: unknown;
}[] = [];
try {
  jobs.push(...JSON.parse(await fs.readFile("data/.queue.json", "utf8")));
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
}
for (const j of jobs)
  if (j.status === "rendering" || j.status === "queued") {
    j.status = "failed";
    j.error = "服务已重启，请重新渲染此任务";
  }
let saving = Promise.resolve();
function persist() {
  const snapshot = JSON.stringify(jobs, null, 2);
  saving = saving.then(async () => {
    await fs.writeFile("data/.queue.tmp", snapshot);
    await fs.rename("data/.queue.tmp", "data/.queue.json");
  });
  return saving;
}
let working = false;
async function pump() {
  if (working) return;
  working = true;
  try {
    let j;
    while ((j = jobs.find((x) => x.status === "queued"))) {
      j.status = "rendering";
      await persist();
      const job = j;
      try {
        await renderStory(
          job.story,
          path.join(ROOT, "outputs", job.id + ".mp4"),
          (p) => (job.progress = p),
        );
        job.status = "done";
        job.url = `/outputs/${job.id}.mp4`;
      } catch (e) {
        job.status = "failed";
        job.error = String(e);
      }
      await persist();
    }
  } finally {
    working = false;
  }
}
app.get("/api/examples", async (_req, res) =>
  res.json((await fs.readdir("examples")).filter((x) => x.endsWith(".json"))),
);
app.get("/api/examples/:name", async (req, res, next) => {
  try {
    const n = String(req.params.name);
    if (!/^[a-z0-9-]+\.json$/.test(n)) throw new Error("无效名称");
    res.json(JSON.parse(await fs.readFile(path.join("examples", n), "utf8")));
  } catch (e) {
    next(e);
  }
});
app.get("/api/projects", async (_req, res) =>
  res.json(
    (await fs.readdir("data")).filter(
      (x) => !x.startsWith(".") && x.endsWith(".json"),
    ),
  ),
);
app.get("/api/projects/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id);
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error("无效项目");
    res.json(JSON.parse(await fs.readFile(`data/${id}.json`, "utf8")));
  } catch (e) {
    next(e);
  }
});
app.post("/api/save", async (req, res, next) => {
  try {
    const s = parseStory(req.body);
    await fs.writeFile(`data/${s.project_id}.json`, JSON.stringify(s, null, 2));
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
app.post("/api/prepare", async (req, res, next) => {
  try {
    res.json(await prepareStory(parseStory(req.body)));
  } catch (e) {
    next(e);
  }
});
app.post("/api/upload", async (req, res, next) => {
  try {
    const ext = String(req.body.extension).toLowerCase();
    if (
      !["png", "jpg", "jpeg", "webp", "wav", "mp3", "m4a", "ogg"].includes(ext)
    )
      throw new Error("不支持的资源格式");
    const name = `assets/${randomUUID()}.${ext}`;
    await fs.mkdir("public/assets", { recursive: true });
    await fs.writeFile(
      path.join("public", name),
      Buffer.from(String(req.body.data), "base64"),
    );
    res.json({ path: name });
  } catch (e) {
    next(e);
  }
});
app.get("/api/jobs", (_req, res) =>
  res.json(jobs.map(({ story: _, ...j }) => j)),
);
app.post("/api/jobs", async (req, res, next) => {
  try {
    const story = parseStory(req.body);
    const job = {
      id: randomUUID(),
      title: story.title,
      status: "queued",
      progress: 0,
      story,
    };
    jobs.push(job);
    await persist();
    void pump().catch((e) => console.error("队列存储失败", String(e)));
    res.json({ id: job.id });
  } catch (e) {
    next(e);
  }
});
app.post("/api/jobs/:id/retry", async (req, res, next) => {
  try {
    const j = jobs.find((j) => j.id === req.params.id);
    if (!j || j.status !== "failed") throw new Error("任务不存在或不可重试");
    j.status = "queued";
    j.progress = 0;
    delete j.error;
    await persist();
    void pump().catch((e) => console.error(String(e)));
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
app.use("/api", (_req, res) => res.status(404).json({ error: "接口不存在" }));
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "spa",
});
app.use(vite.middlewares);
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => res.status(400).json({ error: err.message }),
);
app
  .listen(port, "127.0.0.1", () => console.log(`ChatStory Studio ${origin}`))
  .on("error", (e) => {
    console.error(`端口 ${port} 不可用，请设置 PORT 后重试。`, e.message);
    process.exit(1);
  });
