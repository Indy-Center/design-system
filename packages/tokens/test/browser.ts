import { chromium, type Browser, type Page } from "playwright-core";

let browser: Browser | undefined;

/**
 * A headless Chromium page holding `html`. Set CHROMIUM_PATH to use a
 * browser already on the machine instead of the one Playwright installs.
 */
export async function pageWith(html: string): Promise<Page> {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  const page = await browser.newPage();
  await page.setContent(html);
  return page;
}

export async function closeBrowser(): Promise<void> {
  await browser?.close();
  browser = undefined;
}
