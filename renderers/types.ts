import type { Page } from "puppeteer-core";
import type { ParseArgsConfig } from "util";

export interface Renderer<TConfig = unknown> {
  description: string;
  options: NonNullable<ParseArgsConfig["options"]>;
  parseOptions(values: Record<string, string | boolean | undefined>): TConfig;
  render(page: Page, config: TConfig, output: string): Promise<void>;
}
