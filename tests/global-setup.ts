import path from "node:path";
import type { FullConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function globalSetup(_config: FullConfig) {}

export default globalSetup;
