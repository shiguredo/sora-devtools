import type { FunctionComponent } from 'preact'
import Sora from 'sora-js-sdk'

import { $version } from '@/app/store'

import { DebugButton } from './DebugButton.tsx'

export const Footer: FunctionComponent = () => {
  return (
    <footer>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sora flex items-center justify-end px-4 h-14">
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/shiguredo/sora-devtools"
            className="px-3 py-1 border border-white text-white hover:bg-white hover:text-gray-900 rounded m-1 text-sm no-underline transition-colors"
          >
            GitHub: shiguredo/sora-devtools: {$version.value}
          </a>
          <a
            href="https://github.com/shiguredo/sora-js-sdk"
            className="px-3 py-1 border border-white text-white hover:bg-white hover:text-gray-900 rounded m-1 text-sm no-underline transition-colors"
          >
            GitHub: shiguredo/sora-js-sdk: {Sora.version()}
          </a>
        </div>
      </nav>
      <DebugButton />
    </footer>
  )
}
