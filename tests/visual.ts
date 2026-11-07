import { expect } from "@playwright/test";
import { openBrowser } from "./browser";
import fs from "node:fs/promises";
import { run, bin } from "../scripts/media";
const browser = await openBrowser();
const page = await browser.newPage({ viewport: { width: 1536, height: 1100 } });
await page.goto("http://127.0.0.1:3210");
await page.getByLabel("载入示例").selectOption("demo-a.json");
await page.getByLabel("预览帧").fill("137");
await expect(page.locator('[data-message-id="m5"]')).toBeVisible();
await page.setViewportSize({ width: 1800, height: 2400 });
await page.addStyleTag({
  content:
    ".workspace{display:block;height:2300px}.left,.right,header,footer,.canvas-heading,.preview-note,.transport{display:none}.preview{height:2100px}.preview>div{height:1920px!important;width:1080px!important;border-radius:0!important;box-shadow:none!important}",
});
await page.mouse.move(0, 0);
await page.waitForTimeout(1500);
const phone = page.getByTestId("phone-canvas");
const box = (await phone.boundingBox())!;
await phone.screenshot({ path: "outputs/qa/editor-frame-137.png" });
await browser.close();
const size = await run(bin, [
  "-v",
  "error",
  "-i",
  "outputs/qa/editor-frame-137.png",
  "-f",
  "null",
  "-",
]);
void size;
await run(bin, [
  "-y",
  "-i",
  "outputs/demo-a.mp4",
  "-vf",
  "select=eq(n\\,137)",
  "-frames:v",
  "1",
  "outputs/qa/demo-a-137.png",
]);
// Lossy MP4 uses YUV color conversion; compare after normalizing screenshot size.
await run(bin, [
  "-y",
  "-i",
  "outputs/qa/demo-a-137.png",
  "-i",
  "outputs/qa/editor-frame-137.png",
  "-filter_complex",
  `[0:v]scale=${Math.round(box.width)}:${Math.round(box.height)}[a];[1:v]scale=${Math.round(box.width)}:${Math.round(box.height)}[b];[a][b]ssim=stats_file=outputs/qa/preview-ssim.txt`,
  "-f",
  "null",
  "-",
]);
const stats = await fs.readFile("outputs/qa/preview-ssim.txt", "utf8");
const score = Number(/All:([\d.]+)/.exec(stats)?.[1]);
if (!(score > 0.96)) throw new Error(`预览与导出差异超标: SSIM ${score}`);
await fs.writeFile(
  "docs/preview-parity.json",
  JSON.stringify(
    {
      passed: true,
      frame: 137,
      ssim: score,
      minimum: 0.96,
      width: box.width,
      height: box.height,
    },
    null,
    2,
  ),
);
console.log(`Preview/export SSIM ${score} PASS`);
