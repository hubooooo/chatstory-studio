import { expect } from "@playwright/test";
import { openBrowser } from "./browser";
import fs from "node:fs/promises";
import os from "node:os";
const browser = await openBrowser();
const page = await browser.newPage({ viewport: { width: 1536, height: 1100 } });
await page.goto("http://127.0.0.1:3210");
const s = JSON.parse(await fs.readFile("examples/demo-a.json", "utf8"));
s.project_id = "performance-100";
s.messages = Array.from({ length: 100 }, (_, i) => ({
  ...s.messages[1],
  id: `p${i}`,
  appear_at_ms: i * 350,
  text: `第 ${i + 1} 条虚构测试消息：你好，世界！`,
}));
const started = Date.now();
await page.locator('input[accept=".json"]').setInputFiles({
  name: "performance.json",
  mimeType: "application/json",
  buffer: Buffer.from(JSON.stringify(s)),
});
await expect(page.locator("footer")).toContainText("100 条消息");
const loaded = Date.now();
await page.getByRole("button", { name: "消息", exact: true }).click();
const edit = Date.now();
await page.getByLabel("消息内容").fill("100 条消息下编辑响应测试");
await expect(page.getByLabel("消息内容")).toHaveValue(
  "100 条消息下编辑响应测试",
);
const edit_ms = Date.now() - edit;
await page.locator(".transport button").click();
// Static browser-side source avoids transpiler-generated __name helper references.
const playback = (await page.evaluate(
  "new Promise(resolve=>{const start=performance.now(),seen=new Set();function tick(){seen.add(document.querySelector('[data-testid=transport]').getAttribute('data-frame'));const elapsed=performance.now()-start;if(elapsed>=2000)resolve({elapsed_ms:elapsed,distinct_frames:seen.size});else requestAnimationFrame(tick);}tick();})",
)) as { elapsed_ms: number; distinct_frames: number };
await browser.close();
await fs.writeFile(
  "docs/editor-performance.json",
  JSON.stringify(
    {
      cpu: os.cpus()[0].model,
      total_ram_bytes: os.totalmem(),
      node: process.version,
      platform: os.platform(),
      import_100_messages_ms: loaded - started,
      edit_100_messages_ms: edit_ms,
      preview_observed_fps:
        (playback.distinct_frames - 1) / (playback.elapsed_ms / 1000),
      playback,
      notes:
        "Headless browser on current machine. Import/edit are end-to-end automation timings, not pure component benchmarks.",
    },
    null,
    2,
  ),
);
console.log("100-message editor and preview performance measured");
