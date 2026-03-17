---
name: brow
description: Browser rendering CLI. Use when the user asks to take a screenshot of a web page, capture a website as an image, render an Excalidraw (.excalidraw) file to PNG, or convert a diagram to an image.
---

# brow -- Browser Rendering CLI

## Goal

Produce PNG images from web pages or Excalidraw files using headless Chrome.

## Workflow

### 1. Ensure browser is installed

Before any rendering command, install Chrome for Testing (safe to re-run; no-ops if already cached):

```bash
brow browser install
```

Skip this step if the user provides a `--browser <path>` to an existing Chrome/Chromium binary.

### 2. Screenshot a web page (default mode)

```bash
brow \
  -u <URL> \
  -o <output.png>
```

Required flags:
- `-u, --url` -- URL to capture
- `-o, --output` -- output PNG file path

Optional flags:
- `--width` -- viewport width in pixels (default: 1280)
- `--height` -- viewport height in pixels (default: 800)
- `-s, --scale` -- device scale factor; use 2 for retina/2x (default: 1)
- `--full-page` -- capture full scrollable page (default: true; use `--no-full-page` for viewport only)

Output resolution is `width * scale` by `height * scale` pixels.

### 3. Render an Excalidraw file

```bash
brow \
  -m excalidraw \
  -i <drawing.excalidraw> \
  -o <output.png>
```

Required flags:
- `-i, --input` -- path to `.excalidraw` file
- `-o, --output` -- output PNG file path

Optional flags:
- `-t, --theme` -- `light` or `dark` (default: light)
- `-s, --scale` -- scale multiplier (default: 1; use 2 or 3 for higher resolution)
- `--width` -- explicit output width in pixels (overrides natural dimensions)
- `--height` -- explicit output height in pixels (overrides natural dimensions)

By default output matches the drawing's natural size times scale. Use `--width`/`--height` together for exact pixel dimensions.

### 4. Verify output

Confirm the output file was created:

```bash
ls -la <output.png>
```

## Output Format

All output is PNG. The file is written to the path given by `-o, --output`. On success the tool prints the output path to stdout. On failure it prints an error to stderr and exits with code 1.

## Constraints

- **Browser required.** Always run `browser install` first or pass `--browser <path>`. The tool errors if no browser is found.
- **`-o` is mandatory** on every render command.
- **Web mode requires `-u`** (URL). Excalidraw mode requires `-i` (input file path).
- **PNG only.** No other output formats are supported.
- **Network access required.** Web mode fetches the target page. Excalidraw mode loads renderer libraries from unpkg.com at runtime.
- **`-m web` is the default.** You can omit `-m web` when taking screenshots.
