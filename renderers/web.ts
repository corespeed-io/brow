import type { Renderer } from "./types.ts";

interface WebConfig {
  url: string;
  width: number;
  height: number;
  fullPage: boolean;
  scale: number;
}

export const webRenderer: Renderer<WebConfig> = {
  description: "Take a screenshot of a web page",
  options: {
    url: { type: "string", short: "u" },
    width: { type: "string", default: "1280" },
    height: { type: "string", default: "800" },
    "full-page": { type: "boolean", default: true },
    scale: { type: "string", short: "s", default: "1" },
  },
  parseOptions(values) {
    const url = values.url as string | undefined;
    if (!url) {
      console.error("Error: --url (-u) is required for web mode.");
      console.error("Usage: bun index.ts -m web -u https://example.com -o screenshot.png");
      process.exit(1);
    }
    return {
      url,
      width: parseInt(values.width as string) || 1280,
      height: parseInt(values.height as string) || 800,
      fullPage: values["full-page"] !== false,
      scale: parseFloat(values.scale as string) || 1,
    };
  },
  async render(page, config, output) {
    console.log(`Navigating to: ${config.url}`);
    await page.setViewport({ width: config.width, height: config.height, deviceScaleFactor: config.scale });
    await page.goto(config.url, { waitUntil: "networkidle2" });

    console.log("Taking screenshot...");
    await page.screenshot({ path: output, fullPage: config.fullPage });
    console.log(`Screenshot saved to: ${output}`);
  },
};
