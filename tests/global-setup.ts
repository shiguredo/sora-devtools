import path from 'node:path'
import type { FullConfig } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function globalSetup(_config: FullConfig) {
  // console.log('begin global setup!')
  // Globalな設定があれば設定する
  // console.log('end global setup!')
}

export default globalSetup
