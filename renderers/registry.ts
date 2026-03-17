import type { Renderer } from "./types.ts";
import { webRenderer } from "./web.ts";
import { excalidrawRenderer } from "./excalidraw.ts";

export const renderers: Record<string, Renderer<any>> = {
  web: webRenderer,
  excalidraw: excalidrawRenderer,
};
