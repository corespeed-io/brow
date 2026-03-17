import type { Renderer } from "./types.ts";

interface ExcalidrawConfig {
  input: string;
  theme: "light" | "dark";
  scale: number;
  width?: number;
  height?: number;
}

export const excalidrawRenderer: Renderer<ExcalidrawConfig> = {
  description: "Render an Excalidraw file to an image",
  options: {
    input: { type: "string", short: "i" },
    theme: { type: "string", short: "t", default: "light" },
    scale: { type: "string", short: "s", default: "1" },
    width: { type: "string" },
    height: { type: "string" },
  },
  parseOptions(values) {
    const input = values.input as string | undefined;
    if (!input) {
      console.error("Error: --input (-i) is required for excalidraw mode.");
      console.error("Usage: bun index.ts -m excalidraw -i drawing.excalidraw -o output.png");
      process.exit(1);
    }
    const theme = values.theme as string;
    if (theme !== "light" && theme !== "dark") {
      console.error(`Error: --theme must be "light" or "dark", got "${theme}".`);
      process.exit(1);
    }
    const width = values.width ? parseInt(values.width as string) : undefined;
    const height = values.height ? parseInt(values.height as string) : undefined;
    return { input, theme, scale: parseFloat(values.scale as string) || 1, width, height };
  },
  async render(page, config, output) {
    console.log(`Reading input file: ${config.input}`);
    const inputFile = Bun.file(config.input);
    if (!(await inputFile.exists())) {
      throw new Error(`Input file not found: ${config.input}`);
    }
    const fileContent = await inputFile.text();

    await page.goto("about:blank");
    console.log("Injecting Excalidraw renderer...");
    await page.addScriptTag({ url: "https://unpkg.com/react@18.2.0/umd/react.production.min.js" });
    await page.addScriptTag({ url: "https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js" });
    await page.addScriptTag({ url: "https://unpkg.com/@excalidraw/excalidraw@0.14.2/dist/excalidraw.production.min.js" });

    console.log("Rendering...");
    const base64Data = await page.evaluate(
      async (
        jsonString: string,
        currentTheme: string,
        scaleFactor: number,
        targetWidth: number | undefined,
        targetHeight: number | undefined,
      ) => {
        const data = JSON.parse(jsonString);
        // @ts-ignore — ExcalidrawLib is injected via script tag
        const blob = await window.ExcalidrawLib.exportToBlob({
          elements: data.elements,
          appState: {
            ...data.appState,
            exportBackground: true,
            exportWithDarkMode: currentTheme === "dark",
          },
          mimeType: "image/png",
          exportPadding: 20,
          getDimensions: (naturalWidth: number, naturalHeight: number) => {
            if (targetWidth && targetHeight) {
              const scale = Math.max(targetWidth / naturalWidth, targetHeight / naturalHeight);
              return { width: targetWidth, height: targetHeight, scale };
            }
            return {
              width: naturalWidth * scaleFactor,
              height: naturalHeight * scaleFactor,
              scale: scaleFactor,
            };
          },
        });

        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      },
      fileContent,
      config.theme,
      config.scale,
      config.width,
      config.height,
    );

    const base64Image = base64Data.split(";base64,").pop();
    await Bun.write(output, Buffer.from(base64Image!, "base64"));
    console.log(`Rendered image saved to: ${output}`);
  },
};
