import type React from 'react'
import Sora from 'sora-js-sdk'

import { useSoraDevtoolsStore } from '@/app/store'

import { DebugButton } from './DebugButton.tsx'

export const Footer: React.FC = () => {
  const version = useSoraDevtoolsStore((state) => state.version)
  return (
    <footer>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sora">
        <div className="container max-w-none px-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex-grow" />
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/shiguredo/sora-devtools"
                className="border border-white text-white px-3 py-1.5 rounded hover:bg-white hover:text-sora m-1"
              >
                GitHub: shiguredo/sora-devtools: {version}
              </a>
              <a
                href="https://github.com/shiguredo/sora-js-sdk"
                className="border border-white text-white px-3 py-1.5 rounded hover:bg-white hover:text-sora m-1"
              >
                GitHub: shiguredo/sora-js-sdk: {Sora.version()}
              </a>
            </div>
          </div>
        </div>
      </nav>
      <DebugButton />
    </footer>
  )
}
