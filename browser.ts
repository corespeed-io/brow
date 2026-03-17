import type { Browser as PuppeteerBrowser } from "puppeteer-core";
import puppeteer from "puppeteer-core";
import {
  Browser,
  detectBrowserPlatform,
  getInstalledBrowsers,
  install,
  resolveBuildId,
} from "@puppeteer/browsers";
import { join } from "node:path";
import { homedir } from "node:os";

export const CACHE_DIR = join(homedir(), ".cache", "brow");

export async function installBrowser(): Promise<void> {
  const platform = detectBrowserPlatform();
  if (!platform) {
    throw new Error("Could not detect your platform.");
  }

  const buildId = await resolveBuildId(Browser.CHROME, platform, "stable");
  console.log(`Installing Chrome for Testing (${buildId})...`);

  const result = await install({
    browser: Browser.CHROME,
    buildId,
    cacheDir: CACHE_DIR,
  });

  console.log(`Browser installed: ${result.executablePath}`);
}

async function resolveBrowserPath(explicitPath?: string): Promise<string> {
  // 1. --browser <path> (explicit override)
  if (explicitPath) {
    return explicitPath;
  }

  // 2. Managed browser (via brow browser install)
  const installed = await getInstalledBrowsers({ cacheDir: CACHE_DIR });
  const chrome = installed.find((b) => b.browser === Browser.CHROME);
  if (chrome) {
    return chrome.executablePath;
  }

  // 3. Fail
  throw new Error(
    "No browser available.\n\n" +
      "You have two options:\n\n" +
      "1. Install a managed browser:\n" +
      "   brow browser install\n\n" +
      "2. Specify an existing browser executable:\n" +
      "   brow --browser /path/to/browser",
  );
}

export async function launchBrowser(
  explicitPath?: string,
): Promise<PuppeteerBrowser> {
  const executablePath = await resolveBrowserPath(explicitPath);
  return puppeteer.launch({ headless: true, executablePath });
}
