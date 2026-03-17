# brow

A browser rendering CLI. Take screenshots of web pages and render Excalidraw
files to images using headless Chrome.

`brow` does not bundle a browser. You install or provide one explicitly.

## Install

```bash
bun install
```

## Browser setup

Before rendering, you need a browser. Two options:

### Option 1: Install a managed browser

```bash
brow browser install
```

Downloads Chrome for Testing to `~/.cache/brow`. This becomes the default
runtime browser.

### Option 2: Bring your own

Point to any Chrome/Chromium executable:

```bash
brow --browser /usr/bin/google-chrome -m web -u https://example.com -o screenshot.png
```

### Resolution order

At runtime, `brow` resolves the browser in this order:

1. `--browser <path>` (explicit override)
2. Managed browser (via `brow browser install`)
3. Fail with actionable error

## Usage

```
brow -m <mode> -o <output> [options]
```

### Web screenshots

```bash
brow -m web -u https://example.com -o screenshot.png
```

| Flag            | Default      | Description                                |
| --------------- | ------------ | ------------------------------------------ |
| `-u, --url`     | _(required)_ | URL to screenshot                          |
| `--width`       | `1280`       | Viewport width in pixels                   |
| `--height`      | `800`        | Viewport height in pixels                  |
| `--full-page`   | `true`       | Capture the full scrollable page           |
| `-s, --scale`   | `1`          | Device scale factor (2 = retina/2x output) |

The output image resolution is `width * scale` by `height * scale`. For example,
`--width 1280 --height 800 --scale 2` produces a 2560x1600 image.

### Excalidraw rendering

```bash
brow -m excalidraw -i drawing.excalidraw -o output.png
```

| Flag          | Default      | Description                          |
| ------------- | ------------ | ------------------------------------ |
| `-i, --input` | _(required)_ | Path to `.excalidraw` file           |
| `-t, --theme` | `light`      | `light` or `dark`                    |
| `-s, --scale` | `1`          | Scale multiplier (2 = 2x resolution) |
| `--width`     |              | Explicit output width in pixels      |
| `--height`    |              | Explicit output height in pixels     |

By default the output matches the drawing's natural dimensions. Use `--scale` to
multiply them (e.g. `-s 3` on a 240x140 drawing produces 720x420), or
`--width`/`--height` to set exact output dimensions.

### Global options

| Flag           | Description                                          |
| -------------- | ---------------------------------------------------- |
| `-m, --mode`   | Rendering mode: `web`, `excalidraw` (default: `web`) |
| `-o, --output` | Output file path (required)                          |
| `--browser`    | Path to a browser executable                         |
| `-h, --help`   | Show help                                            |

### Commands

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `brow browser install` | Download and cache a managed browser |

## Adding a renderer

Create a new file in `renderers/` that exports a `Renderer<TConfig>` and
register it in `renderers/registry.ts`. Your renderer receives a Puppeteer
`Page` and is responsible for navigating, rendering, and writing the output
file.
