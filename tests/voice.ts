import { expect } from "@playwright/test";
import { openBrowser } from "./browser";
import fs from "node:fs/promises";
const b = JSON.parse(await fs.readFile("examples/demo-b.json", "utf8"));
for (const m of b.messages) m.voice_mode = "manual";
const browser = await openBrowser();
const page = await browser.newPage();
await page.goto("http://127.0.0.1:3210");
await page
  .locator('input[accept=".json"]')
  .setInputFiles({
    name: "voice-test.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(b)),
  });
await expect(page.getByLabel("故事标题")).toHaveValue(b.title);
await page.getByLabel("预览帧").fill("140");
const bar = page.getByRole("button", { name: "试听语音" }).first();
await expect(bar).toContainText("4″");
await bar.click();
await expect(bar).toContainText(/[▂▃]/);
await expect(bar).toContainText(")))", { timeout: 10000 });
await browser.close();
await fs.writeFile(
  "docs/voice-ui.json",
  JSON.stringify(
    {
      passed: true,
      manual_click_playback: true,
      waveform_updates: true,
      ended_restores_static_bar: true,
      display_seconds: 4,
    },
    null,
    2,
  ),
);
console.log("Manual voice playback and end-state animation PASS");
