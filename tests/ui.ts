import { expect } from "@playwright/test";
import { openBrowser } from "./browser";
import fs from "node:fs/promises";
const browser = await openBrowser();
const page = await browser.newPage({ viewport: { width: 1536, height: 1100 } });
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
const start = Date.now();
await page.goto("http://127.0.0.1:3210");
await expect(
  page.getByRole("button", { name: "保存项目", exact: true }),
).toBeVisible();
await page.getByLabel("状态栏时间").fill("23:59");
await page.getByLabel("网络").selectOption("5G");
await page.getByLabel("电量 85%").focus();
await page.keyboard.press("End");
await page.keyboard.press("ArrowLeft");
await page.getByLabel("信号强度").focus();
await page.keyboard.press("Home");
await page.keyboard.press("ArrowRight");
await page.keyboard.press("ArrowRight");
await page.getByLabel("充电中").check();
await page.getByRole("button", { name: "保存项目", exact: true }).click();
await expect(page.getByRole("status")).toContainText("项目已保存");
await page.reload();
await page.getByLabel("载入项目").selectOption("new-story.json");
await expect(page.getByLabel("状态栏时间")).toHaveValue("23:59");
await expect(page.getByLabel("网络")).toHaveValue("5G");
await expect(page.getByLabel("电量 99%")).toHaveValue("99");
await expect(page.getByLabel("信号强度")).toHaveValue("2");
await expect(page.getByLabel("充电中")).toBeChecked();
await page.getByLabel("载入示例").selectOption("demo-c.json");
await page.getByRole("button", { name: "消息", exact: true }).click();
await page.getByLabel("消息内容").fill("测试长文字 🌊 Hello 世界");
await expect(page.getByLabel("消息内容")).toHaveValue(
  "测试长文字 🌊 Hello 世界",
);
await page.getByRole("button", { name: "外观", exact: true }).click();
await page.getByLabel("载入示例").selectOption("demo-c.json");
await page.getByLabel("预览帧").fill("161");
await expect(page.locator('[data-message-id="m5"]')).toBeVisible();
await fs.mkdir("docs/screenshots", { recursive: true });
await page.screenshot({ path: "docs/screenshots/editor.png", fullPage: true });
if (errors.length) throw new Error(errors.join("\n"));
await fs.writeFile(
  "docs/ui-results.json",
  JSON.stringify(
    {
      passed: true,
      checks: 7,
      page_errors: errors,
      elapsed_ms: Date.now() - start,
    },
    null,
    2,
  ),
);
await browser.close();
console.log("UI: 7 checks PASS");
