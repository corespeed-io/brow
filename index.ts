import { parseArgs } from "util";
import { launchBrowser, installBrowser } from "./browser.ts";
import { renderers } from "./renderers/registry.ts";

const args = Bun.argv.slice(2);

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
  console.log(`Usage: brow -m <mode> -o <output> [options]\n`);
  console.log("Commands:");
  console.log("  browser install         Install a managed browser\n");
  console.log("Global options:");
  console.log("  -m, --mode <mode>       Rendering mode (default: web)");
  console.log("  -o, --output <path>     Output file path (required)");
  console.log("  --browser <path>        Path to browser executable");
  console.log("  -h, --help              Show this help message\n");
  console.log(`Mode "${mode}": ${renderer.description}`);
  console.log("Options:");
  for (const [name, opt] of Object.entries(renderer.options)) {
    const short = opt.short ? `-${opt.short}, ` : "    ";
    const def = "default" in opt ? ` (default: ${opt.default})` : "";
    console.log(`  ${short}--${name}${def}`);
  }
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
