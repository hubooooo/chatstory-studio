import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { run, ROOT } from "./media";
const target = path.join(ROOT, ".cache", "冷启动 test");
await fs.mkdir(target, { recursive: true });
const list = await run("git", [
  "-c",
  `safe.directory=${ROOT.replaceAll("\\", "/")}`,
  "ls-files",
  "--cached",
  "--others",
  "--exclude-standard",
  "-z",
]);
for (const name of list.split("\0").filter(Boolean)) {
  const source = path.join(ROOT, name);
  if ((await fs.stat(source)).isDirectory()) continue;
  const dest = path.join(target, name);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(source, dest);
}
const start = Date.now();
await run("cmd.exe", ["/d", "/s", "/c", "npm ci"], { cwd: target });
const installed = Date.now();
await run("cmd.exe", ["/d", "/s", "/c", "npm run build"], { cwd: target });
const child = spawn(
  process.execPath,
  ["--import", "tsx", "scripts/server.ts"],
  {
    cwd: target,
    env: { ...process.env, PORT: "3212" },
    shell: false,
    windowsHide: true,
  },
);
let log = "";
child.stdout.on("data", (d) => (log += d));
child.stderr.on("data", (d) => (log += d));
const boot = Date.now();
try {
  let online = false;
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch("http://127.0.0.1:3212/api/examples");
      if (r.ok) {
        online = true;
        break;
      }
    } catch {
      /* Wait boundedly for startup. */
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  if (!online) throw new Error("冷启动服务失败: " + log);
  const ready = Date.now();
  const s = JSON.parse(
    await fs.readFile(path.join(target, "examples/demo-a.json"), "utf8"),
  );
  s.messages = s.messages.slice(0, 1);
  s.render_settings.tail_ms = 500;
  await fs.writeFile(
    path.join(target, "examples/smoke.json"),
    JSON.stringify(s),
  );
  await run(
    process.execPath,
    [
      "--import",
      "tsx",
      "scripts/cli.ts",
      "render",
      "--input",
      "examples/smoke.json",
      "--output",
      "outputs/第一条 video.mp4",
    ],
    { cwd: target },
  );
  await fs.writeFile(
    "docs/cold-start-results.json",
    JSON.stringify(
      {
        passed: true,
        isolated_source_copy: true,
        install_ms: installed - start,
        server_ready_ms: ready - boot,
        build: "PASS",
        render: "PASS",
        path_case: "Chinese and space directory + output filename",
        note: "Same Windows machine and shared npm download cache; not a fresh OS.",
      },
      null,
      2,
    ),
  );
  console.log(
    "Cold source install, build, server and Chinese/space-path MP4: PASS",
  );
} finally {
  child.kill();
}
