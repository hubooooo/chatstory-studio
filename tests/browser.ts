import { chromium } from "@playwright/test";
export function openBrowser() {
  const executablePath = process.env.CHROME_PATH;
  return chromium.launch({
    executablePath,
    channel:
      !executablePath && process.platform === "win32" ? "chrome" : undefined,
    headless: true,
  });
}
