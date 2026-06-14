import path from "node:path";
import type { FullConfig } from "@playwright/test";

process.loadEnvFile(path.resolve(process.cwd(), ".env.local"));

async function globalSetup(_config: FullConfig) {}

export default globalSetup;
