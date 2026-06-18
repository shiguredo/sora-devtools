import fs from "node:fs";
import path from "node:path";
import type { FullConfig } from "@playwright/test";

// CI 環境では .env.local が存在しないため、存在確認を行う
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

async function globalSetup(_config: FullConfig) {}

export default globalSetup;
