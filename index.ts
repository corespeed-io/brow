import { parseArgs } from "util";
import { launchBrowser, installBrowser } from "./browser.ts";
import { renderers } from "./renderers/registry.ts";

const args = Bun.argv.slice(2);

function printHelp() {
  console.log(`brow - Browser-based rendering CLI

Usage: brow [command] [options]

Commands:
  browser install              Download and install a managed browser

Global Options:
  -m, --mode <mode>            Rendering mode: ${Object.keys(renderers).join(", ")} (default: web)
  -o, --output <path>          Output file path (required)
      --browser <path>         Path to browser executable
  -h, --help                   Show this help message

Web Mode (default):
  ${renderers.web.description}
  -u, --url <url>              URL to screenshot (required)
      --width <pixels>         Viewport width (default: 1280)
      --height <pixels>        Viewport height (default: 800)
      --full-page              Capture full scrollable page (default: true)
  -s, --scale <factor>         Device scale factor (default: 1)

Excalidraw Mode:
  ${renderers.excalidraw.description}
  -i, --input <path>           Path to .excalidraw file (required)
  -t, --theme <theme>          Theme: light or dark (default: light)
  -s, --scale <factor>         Scale multiplier (default: 1)
      --width <pixels>         Explicit output width
      --height <pixels>        Explicit output height

Examples:
  brow -u https://example.com -o screenshot.png
  brow -m excalidraw -i drawing.excalidraw -o output.png
  brow browser install`);
}

// Show help when no arguments provided
if (args.length === 0) {
  printHelp();
  process.exit(0);
}

// Handle "browser" subcommand
if (args[0] === "browser") {
  if (args[1] === "install") {
    await installBrowser();
    process.exit(0);
  }
  console.error(`Unknown command: browser ${args[1] ?? ""}`);
  console.error("Available: brow browser install");
  process.exit(1);
}

// First pass: extract --mode and --help, ignore unknown flags
const { values: baseValues } = parseArgs({
  args,
  options: {
    mode: { type: "string", short: "m", default: "web" },
    help: { type: "boolean", short: "h", default: false },
    output: { type: "string", short: "o" },
    browser: { type: "string" },
  },
  strict: false,
  allowPositionals: true,
});

const mode = baseValues.mode as string;
const renderer = renderers[mode];

if (!renderer) {
  const available = Object.keys(renderers).join(", ");
  console.error(`Error: unknown mode "${mode}". Available modes: ${available}`);
  process.exit(1);
}

// Show help if requested
if (baseValues.help) {
  printHelp();
  process.exit(0);
}

// Second pass: strict validation with renderer-specific options
const { values } = parseArgs({
  args,
  options: {
    mode: { type: "string", short: "m", default: "web" },
    help: { type: "boolean", short: "h", default: false },
    output: { type: "string", short: "o" },
    browser: { type: "string" },
    ...renderer.options,
  },
  strict: true,
  allowPositionals: true,
});

const output = values.output as string | undefined;
if (!output) {
  console.error("Error: --output (-o) is required.");
  process.exit(1);
}

const config = renderer.parseOptions(values as Record<string, string | boolean | undefined>);

// Launch browser, render, clean up
let browser;
try {
  browser = await launchBrowser(values.browser as string | undefined);
  const page = await browser.newPage();
  await renderer.render(page, config, output);
} catch (error) {
  console.error("Error:", error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await browser?.close();
}
