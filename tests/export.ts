import { expect } from "@playwright/test";
import { openBrowser } from "./browser";
import fs from "node:fs/promises";
import { probe } from "../scripts/media";
const browser = await openBrowser();
const page = await browser.newPage({ viewport: { width: 1536, height: 1100 } });
await page.goto("http://127.0.0.1:3210");
const story = JSON.parse(await fs.readFile("examples/demo-a.json", "utf8"));
story.project_id = "ui-export";
story.title = "界面端到端验收";
story.messages = story.messages.slice(0, 2);
story.render_settings.tail_ms = 300;
await page.locator('input[accept=".json"]').setInputFiles({
  name: "ui-export.json",
  mimeType: "application/json",
  buffer: Buffer.from(JSON.stringify(story)),
});
await expect(page.getByLabel("故事标题")).toHaveValue(story.title);
const response = page.waitForResponse(
  (r) => r.url().endsWith("/api/jobs") && r.request().method() === "POST",
);
await page.getByRole("button", { name: "↗ 导出视频", exact: true }).click();
const id = (await (await response).json()).id;
await page.getByRole("button", { name: "导出", exact: true }).click();
await expect(page.locator(`a[href="/outputs/${id}.mp4"]`)).toBeVisible({
  timeout: 120000,
});
const p = await probe(`outputs/${id}.mp4`);
await page.reload();
await page.getByRole("button", { name: "导出", exact: true }).click();
await expect(page.locator(`a[href="/outputs/${id}.mp4"]`)).toBeVisible();
const saved = JSON.parse(await fs.readFile("data/.queue.json", "utf8"));
if (
  !saved.some(
    (j: { id: string; status: string }) => j.id === id && j.status === "done",
  )
)
  throw new Error("队列未落盘");
await browser.close();
await fs.writeFile(
  "docs/ui-export.json",
  JSON.stringify(
    {
      passed: true,
      import: true,
      render_from_editor: true,
      progress_download_link: true,
      reload: true,
      persisted_queue: true,
      width: p.streams[0].width,
      height: p.streams[0].height,
    },
    null,
    2,
  ),
);
console.log("Editor import -> export -> probe -> reload persisted queue: PASS");
